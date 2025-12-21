import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, func, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class TradeReflection(Base):
    __tablename__ = "trade_reflections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trade_id = Column(UUID(as_uuid=True), ForeignKey("trades.id"), unique=True, nullable=False)
    
    what_went_well = Column(Text, nullable=True)
    what_went_wrong = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    satisfaction_rating = Column(Integer, nullable=True) # 1-5

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    trade = relationship("Trade", back_populates="reflection")
