from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from enum import Enum

class TradeType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

# Shared properties
class TradeBase(BaseModel):
    ticker_symbol: str = Field(..., min_length=1, max_length=10, pattern=r"^[A-Z0-9.\-]+$")
    trade_type: TradeType
    quantity: Decimal = Field(..., gt=0)
    price: Decimal = Field(..., ge=0)
    total_amount: Decimal
    executed_at: Optional[datetime] = None
    status: Optional[TradeStatus] = TradeStatus.OPEN

    # Rationale fields
    market_env: Optional[str] = None
    technical_analysis: Optional[str] = None
    fundamental_analysis: Optional[str] = None
    risk_reward_ratio: Optional[Decimal] = None
    confidence_level: Optional[int] = Field(None, ge=1, le=5)
    rationale: Optional[str] = None

# Properties to receive via API on creation
class TradeCreate(TradeBase):
    pass

# Properties to receive via API on update
class TradeUpdate(BaseModel):
    ticker_symbol: Optional[str] = None
    trade_type: Optional[TradeType] = None
    quantity: Optional[Decimal] = None
    price: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    executed_at: Optional[datetime] = None
    status: Optional[TradeStatus] = None
    profit_loss: Optional[Decimal] = None
    
    # Rationale fields
    market_env: Optional[str] = None
    technical_analysis: Optional[str] = None
    fundamental_analysis: Optional[str] = None
    risk_reward_ratio: Optional[Decimal] = None
    confidence_level: Optional[int] = Field(None, ge=1, le=5)
    rationale: Optional[str] = None

# Properties to return via API
class TradeResponse(TradeBase):
    id: UUID
    user_id: UUID
    profit_loss: Optional[Decimal] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TradeClose(BaseModel):
    closing_price: Decimal
    closed_at: Optional[datetime] = None
