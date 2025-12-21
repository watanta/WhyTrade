from typing import Any, List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/positions", response_model=List[schemas.trade.PositionResponse])
def read_positions(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """ユーザーの保有ポジションを銘柄ごとに集計して取得"""
    open_trades = (
        db.query(models.trade.Trade)
        .filter(
            models.trade.Trade.user_id == current_user.id,
            models.trade.Trade.status == models.trade.TradeStatus.OPEN
        )
        .order_by(models.trade.Trade.executed_at.desc(), models.trade.Trade.id.desc())
        .all()
    )
    
    positions_map = {}
    for trade in open_trades:
        symbol = trade.ticker_symbol
        if symbol not in positions_map:
            positions_map[symbol] = {
                "ticker_symbol": symbol,
                "total_quantity": Decimal(0),
                "total_amount": Decimal(0),
                "trades": []
            }
        
        positions_map[symbol]["total_quantity"] += trade.quantity
        positions_map[symbol]["total_amount"] += trade.total_amount
        positions_map[symbol]["trades"].append(trade)
    
    result = []
    for symbol, data in positions_map.items():
        avg_price = data["total_amount"] / data["total_quantity"] if data["total_quantity"] > 0 else 0
        result.append({
            "ticker_symbol": symbol,
            "total_quantity": data["total_quantity"],
            "average_price": avg_price,
            "total_amount": data["total_amount"],
            "trades": data["trades"]
        })
    
    return result

@router.get("/", response_model=List[schemas.trade.TradeResponse])
def read_trades(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """ユーザーの全取引を取得"""
    trades = (
        db.query(models.trade.Trade)
        .filter(models.trade.Trade.user_id == current_user.id)
        .order_by(models.trade.Trade.executed_at.desc(), models.trade.Trade.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return trades

@router.post("/", response_model=schemas.trade.TradeResponse)
def create_trade(
    *,
    db: Session = Depends(deps.get_db),
    trade_in: schemas.trade.TradeCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """新規取引を登録"""
    trade = models.trade.Trade(
        **trade_in.model_dump(),
        user_id=current_user.id
    )
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade

@router.get("/{id}", response_model=schemas.trade.TradeResponse)
def read_trade(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """取引詳細を取得"""
    trade = db.query(models.trade.Trade).filter(
        models.trade.Trade.id == id,
        models.trade.Trade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.put("/{id}", response_model=schemas.trade.TradeResponse)
def update_trade(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    trade_in: schemas.trade.TradeUpdate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """取引情報を更新"""
    trade = db.query(models.trade.Trade).filter(
        models.trade.Trade.id == id,
        models.trade.Trade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    update_data = trade_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trade, field, value)
    
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade

@router.delete("/{id}", response_model=schemas.trade.TradeResponse)
def delete_trade(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """取引を削除"""
    trade = db.query(models.trade.Trade).filter(
        models.trade.Trade.id == id,
        models.trade.Trade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    db.delete(trade)
    db.commit()
    return trade

@router.post("/{id}/close", response_model=schemas.trade.TradeResponse)
def settle_trade(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    trade_close: schemas.trade.TradeClose,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """保有中の取引を決済し、履歴に新しい行（売決済/買決済）を追加"""
    from datetime import datetime
    
    # 1. 元の取引を取得
    trade = db.query(models.trade.Trade).filter(
        models.trade.Trade.id == id,
        models.trade.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    if trade.status == models.trade.TradeStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Trade is already closed")
    
    # 元の取引をクローズ済みに更新
    trade.status = models.trade.TradeStatus.CLOSED
    
    # 2. 決済用の新しい取引記録を作成
    # 買いなら売り決済、売りなら買い決済
    exit_type = models.trade.TradeType.SELL if trade.trade_type == models.trade.TradeType.BUY else models.trade.TradeType.BUY
    
    # 損益計算
    if trade.trade_type == models.trade.TradeType.BUY:
        profit_loss = (trade_close.closing_price - trade.price) * trade.quantity
    else:
        profit_loss = (trade.price - trade_close.closing_price) * trade.quantity
        
    exit_trade = models.trade.Trade(
        user_id=current_user.id,
        ticker_symbol=trade.ticker_symbol,
        trade_type=exit_type,
        quantity=trade.quantity,
        price=trade_close.closing_price,
        total_amount=trade.quantity * trade_close.closing_price,
        executed_at=trade_close.closed_at or datetime.now(),
        status=models.trade.TradeStatus.CLOSED,
        profit_loss=profit_loss,
        rationale=trade_close.rationale,
        related_trade_id=trade.id
    )
    
    db.add(trade)
    db.add(exit_trade)
    db.commit()
    db.refresh(exit_trade)
    return exit_trade
