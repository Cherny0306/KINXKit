"""
Tests for {{projectName}}
"""

import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_root():
    """Test root endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_chat_endpoint():
    """Test chat endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/chat", json={"message": "Hello!"})
    assert response.status_code == 200
    # Note: This test will fail if OPENAI_API_KEY is not set
