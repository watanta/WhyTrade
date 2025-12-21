import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Numeric, func, Text, Integer
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
    
    # Rationale fields
    market_env = Column(Text, nullable=True)
    technical_analysis = Column(Text, nullable=True)
    fundamental_analysis = Column(Text, nullable=True)
    risk_reward_ratio = Column(Numeric(precision=10, scale=2), nullable=True)
    confidence_level = Column(Integer, nullable=True) # 1-5
    rationale = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Enhanced entry rationale fields
    entry_trigger = Column(Text, nullable=True)  # エントリー理由/トリガー
    target_price = Column(Numeric(precision=20, scale=4), nullable=True)  # 目標価格
    stop_loss = Column(Numeric(precision=20, scale=4), nullable=True)  # 損切りライン
    holding_period = Column(String(50), nullable=True)  # 保有期間の想定 (デイトレ/スイング/中期/長期)
    position_sizing_rationale = Column(Text, nullable=True)  # ポジションサイズの根拠
    competitor_analysis = Column(Text, nullable=True)  # 競合他社との比較
    catalyst = Column(Text, nullable=True)  # カタリスト（材料）

    user = relationship("User", back_populates="trades")
    
    related_trade_id = Column(UUID(as_uuid=True), ForeignKey("trades.id"), nullable=True)
    related_trade = relationship("Trade", remote_side=[id])

    reflection = relationship("TradeReflection", back_populates="trade", uselist=False, cascade="all, delete-orphan")
