from typing import Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models import reflection as models
from app.models import trade as trade_models
from app.schemas import reflection as schemas

router = APIRouter()

@router.post("/{trade_id}/reflection", response_model=schemas.ReflectionResponse)
def create_reflection(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: UUID,
    reflection_in: schemas.ReflectionCreate,
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Create a reflection for a specific trade.
    """
    trade = db.query(trade_models.Trade).filter(
        trade_models.Trade.id == trade_id,
        trade_models.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
        
    if trade.status != trade_models.TradeStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Only closed trades can have reflections")

    existing_reflection = db.query(models.TradeReflection).filter(
        models.TradeReflection.trade_id == trade_id
    ).first()
    
    if existing_reflection:
        raise HTTPException(status_code=400, detail="Reflection already exists for this trade")

    db_reflection = models.TradeReflection(
        trade_id=trade_id,
        **reflection_in.model_dump()
    )
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    return db_reflection

@router.get("/{trade_id}/reflection", response_model=schemas.ReflectionResponse)
def read_reflection(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: UUID,
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Get reflection for a specific trade.
    """
    trade = db.query(trade_models.Trade).filter(
        trade_models.Trade.id == trade_id,
        trade_models.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    reflection = db.query(models.TradeReflection).filter(
        models.TradeReflection.trade_id == trade_id
    ).first()
    
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")
        
    return reflection

@router.put("/{trade_id}/reflection", response_model=schemas.ReflectionResponse)
def update_reflection(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: UUID,
    reflection_in: schemas.ReflectionUpdate,
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Update reflection for a specific trade.
    """
    trade = db.query(trade_models.Trade).filter(
        trade_models.Trade.id == trade_id,
        trade_models.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    reflection = db.query(models.TradeReflection).filter(
        models.TradeReflection.trade_id == trade_id
    ).first()
    
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    update_data = reflection_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reflection, field, value)

    db.add(reflection)
    db.commit()
    db.refresh(reflection)
    return reflection
