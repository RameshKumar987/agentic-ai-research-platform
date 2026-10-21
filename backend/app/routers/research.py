from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from ..config import settings
from ..schemas import GenerateResearchRequest, Project
from ..services.generator import build_project
from ..services.llm import generate_gemini_summary
from ..store import store

router = APIRouter(tags=["research"])


@router.post("/research/generate", response_model=Project, status_code=201)
async def generate_research(payload: GenerateResearchRequest) -> Project:
    project = build_project(payload)

    if settings.llm_configured:
        enhanced = await generate_gemini_summary(project)
        if enhanced:
            notes = [
                *project.meta.notes,
                (
                    "The summary was rewritten by Gemini. Sections, APIs, entities, risks, and the "
                    "architecture graph remain deterministic template output."
                ),
            ]
            project = project.model_copy(
                update={
                    "summary": enhanced,
                    "updated_at": datetime.now(timezone.utc),
                    "meta": project.meta.model_copy(
                        update={
                            "generator": "gemini",
                            "model": settings.gemini_model,
                            "llm_configured": True,
                            "notes": notes,
                        }
                    ),
                }
            )

    return store.add(project)
