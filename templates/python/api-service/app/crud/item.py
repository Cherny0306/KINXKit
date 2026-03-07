"""
CRUD 操作 - Item
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


async def get_item(db: AsyncSession, item_id: int) -> Optional[Item]:
    """获取单个 Item"""
    result = await db.execute(select(Item).where(Item.id == item_id))
    return result.scalar_one_or_none()


async def get_items(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Item]:
    """获取 Item 列表"""
    result = await db.execute(select(Item).offset(skip).limit(limit))
    return list(result.scalars().all())


async def create_item(db: AsyncSession, item: ItemCreate) -> Item:
    """创建 Item"""
    db_item = Item(**item.dict())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def update_item(
    db: AsyncSession, item_id: int, item: ItemUpdate
) -> Optional[Item]:
    """更新 Item"""
    db_item = await get_item(db, item_id)
    if db_item:
        for field, value in item.dict(exclude_unset=True).items():
            setattr(db_item, field, value)
        await db.commit()
        await db.refresh(db_item)
    return db_item


async def delete_item(db: AsyncSession, item_id: int) -> bool:
    """删除 Item"""
    db_item = await get_item(db, item_id)
    if db_item:
        await db.delete(db_item)
        await db.commit()
        return True
    return False
