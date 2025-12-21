from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

# Shared properties
class ReflectionBase(BaseModel):
    what_went_well: Optional[str] = None
    what_went_wrong: Optional[str] = None
    lessons_learned: Optional[str] = None
    action_items: Optional[str] = None
    satisfaction_rating: Optional[int] = Field(None, ge=1, le=5)

# Properties to receive via API on creation
class ReflectionCreate(ReflectionBase):
    pass

# Properties to receive via API on update
class ReflectionUpdate(ReflectionBase):
    pass

# Properties to return via API
class ReflectionResponse(ReflectionBase):
    id: UUID
    trade_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
