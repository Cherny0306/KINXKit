"""
Data Models
"""

from pydantic import BaseModel
from typing import Optional, List


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str
    content: str


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    history: Optional[List[ChatMessage]] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    status: str


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    service: str


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    status: str
