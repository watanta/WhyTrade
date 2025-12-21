import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Numeric, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class TradeType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class Trade(Base):
    __tablename__ = "trades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ticker_symbol = Column(String(20), nullable=False, index=True)
    trade_type = Column(Enum(TradeType), nullable=False)
    quantity = Column(Numeric(precision=20, scale=4), nullable=False)
    price = Column(Numeric(precision=20, scale=4), nullable=False)
    total_amount = Column(Numeric(precision=20, scale=4), nullable=False)
    executed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(Enum(TradeStatus), default=TradeStatus.OPEN, nullable=False)
    profit_loss = Column(Numeric(precision=20, scale=4), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="trades")
