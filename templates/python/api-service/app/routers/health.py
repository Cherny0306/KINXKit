"""
健康检查路由
"""

from fastapi import APIRouter
from app.schemas.item import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查端点"""
    return HealthResponse(
        status="healthy",
        message="{{projectName}} is running",
    )
