from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app import schemas, models
from app.api import deps

router = APIRouter()

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
