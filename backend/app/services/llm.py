from __future__ import annotations

import logging

import httpx

from ..config import settings
from ..schemas import Project

logger = logging.getLogger(__name__)

PROMPT = (
    "You are assisting a software architecture research tool. Rewrite the following "
    "project summary in 3-4 concise sentences for a technical stakeholder. Preserve all "
    "scope caveats and do not invent features, citations, metrics, or claims of completed "
    "implementation. Return plain text only, no markdown or quotation marks.\n\n"
    "Title: {title}\nDomain: {domain}\nComplexity: {complexity}\n\nSummary:\n{summary}"
)


async def generate_gemini_summary(project: Project) -> str | None:
    """Optional summary enhancement. Returns None on any failure so callers fall back."""
    if not settings.llm_configured:
        return None

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent"
    )
    prompt = PROMPT.format(
        title=project.title,
        domain=project.domain,
        complexity=project.complexity,
        summary=project.summary,
    )
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 350},
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(
                url,
                params={"key": settings.gemini_api_key},
                json=body,
            )
            response.raise_for_status()
            data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = " ".join(str(text).strip().strip('"').split())
        if not 60 <= len(cleaned) <= 1200:
            logger.warning("Gemini returned a summary outside the accepted length.")
            return None
        return cleaned
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
        logger.warning("Gemini summary enhancement failed: %s", type(exc).__name__)
        return None
