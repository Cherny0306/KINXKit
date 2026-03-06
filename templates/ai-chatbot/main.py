"""
{{projectName}} - FastAPI Main Application
{{description}}
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.ai import AIService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AI service
ai_service = AIService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager"""
    logger.info("Starting {{projectName}}...")
    yield
    logger.info("Shutting down {{projectName}}...")


# Create FastAPI app
app = FastAPI(
    title="{{projectName}}",
    description="{{description}}",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to {{projectName}}!",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "{{projectName}}"
    }


@app.post("/chat")
async def chat(message: str):
    """
    Chat endpoint for AI conversation

    Args:
        message: User message

    Returns:
        AI response
    """
    try:
        response = await ai_service.chat(message)
        return {
            "response": response,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {
            "error": str(e),
            "status": "error"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
