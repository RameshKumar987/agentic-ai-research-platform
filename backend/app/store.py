from __future__ import annotations

from collections import OrderedDict
from threading import RLock

from .schemas import Project, ProjectSummary


class ProjectStore:
    """Thread-safe, in-memory store. Data is lost when the process restarts."""

    def __init__(self, max_projects: int = 200) -> None:
        self._items: OrderedDict[str, Project] = OrderedDict()
        self._lock = RLock()
        self._max_projects = max(1, max_projects)

    def add(self, project: Project) -> Project:
        with self._lock:
            if len(self._items) >= self._max_projects:
                self._items.popitem(last=False)
            self._items[project.id] = project
        return project

    def get(self, project_id: str) -> Project | None:
        with self._lock:
            return self._items.get(project_id)

    def list_summaries(self) -> list[ProjectSummary]:
        with self._lock:
            projects = list(self._items.values())
        projects.reverse()
        return [
            ProjectSummary(
                id=project.id,
                title=project.title,
                domain=project.domain,
                complexity=project.complexity,
                created_at=project.created_at,
                section_count=len(project.sections),
                generator=project.meta.generator,
            )
            for project in projects
        ]

    def count(self) -> int:
        with self._lock:
            return len(self._items)

    def clear(self) -> None:
        with self._lock:
            self._items.clear()


store = ProjectStore()
