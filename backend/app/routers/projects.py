from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..schemas import Project, ProjectList
from ..store import store

router = APIRouter(tags=["projects"])


@router.get("/projects", response_model=ProjectList)
def list_projects() -> ProjectList:
    items = store.list_summaries()
    return ProjectList(items=items, count=len(items))


@router.get("/projects/{project_id}", response_model=Project, responses={404: {"description": "Project not found"}})
def get_project(project_id: str):
    project = store.get(project_id)
    if project is None:
        return JSONResponse(
            status_code=404,
            content={
                "error": {
                    "code": "PROJECT_NOT_FOUND",
                    "message": "That project does not exist in this session. It may have been cleared by a backend restart.",
                }
            },
        )
    return project
