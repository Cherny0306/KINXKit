"""
AI Service - Handles AI model integration
"""

import openai
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI Service for chat completion"""

    def __init__(self):
        """Initialize AI service"""
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        logger.info("AI Service initialized")

    async def chat(
        self,
        message: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Get AI response for user message

        Args:
            message: User message
            max_tokens: Maximum tokens in response
            temperature: Response randomness (0-2)

        Returns:
            AI response text
        """
        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": message}
                ],
                max_tokens=max_tokens or settings.OPENAI_MAX_TOKENS,
                temperature=temperature or settings.OPENAI_TEMPERATURE
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"AI chat error: {str(e)}")
            raise

    async def chat_with_history(
        self,
        message: str,
        history: list[dict],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Get AI response with conversation history

        Args:
            message: User message
            history: Conversation history
            max_tokens: Maximum tokens in response
            temperature: Response randomness (0-2)

        Returns:
            AI response text
        """
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                *history,
                {"role": "user", "content": message}
            ]

            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=max_tokens or settings.OPENAI_MAX_TOKENS,
                temperature=temperature or settings.OPENAI_TEMPERATURE
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"AI chat with history error: {str(e)}")
            raise
