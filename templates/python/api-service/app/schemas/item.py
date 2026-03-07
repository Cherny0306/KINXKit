"""
Pydantic 模式
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ItemBase(BaseModel):
    """Item 基础模式"""

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)


class ItemCreate(ItemBase):
    """创建 Item 的模式"""

    pass


class ItemUpdate(ItemBase):
    """更新 Item 的模式"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)


class ItemResponse(ItemBase):
    """Item 响应模式"""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """健康检查响应"""

    status: str
    message: str
