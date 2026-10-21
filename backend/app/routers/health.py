from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import APIRouter

from ..config import settings
from ..schemas import GeneratorInfo, HealthResponse
from ..store import store

router = APIRouter(tags=["system"])
STARTED_AT = time.monotonic()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    active = "gemini" if settings.llm_configured else "template"
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.version,
        timestamp=datetime.now(timezone.utc),
        uptime_seconds=round(time.monotonic() - STARTED_AT, 2),
        projects=store.count(),
        generator=GeneratorInfo(
            default="template",
            active=active,
            llm_configured=settings.llm_configured,
        ),
        storage="in-memory (session only)",
    )
