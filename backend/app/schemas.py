from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

Domain = Literal["Healthcare", "Education", "Finance", "E-commerce", "Other"]
Complexity = Literal["Basic", "Intermediate", "Advanced"]
GeneratorName = Literal["template", "gemini"]


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class GenerateResearchRequest(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    idea: str = Field(min_length=20, max_length=4000)
    domain: Domain
    complexity: Complexity

    @field_validator("title", "idea")
    @classmethod
    def clean_text(cls, value: str, info) -> str:
        cleaned = " ".join(value.split())
        minimum = 3 if info.field_name == "title" else 20
        if len(cleaned) < minimum:
            raise ValueError(
                f"Please provide at least {minimum} characters of meaningful text."
            )
        return cleaned


class Section(ApiModel):
    key: str
    title: str
    content: list[str]


class TechItem(ApiModel):
    name: str
    category: str
    purpose: str
    status: Literal["MVP", "Proposed"]


class ApiEndpoint(ApiModel):
    method: str
    path: str
    purpose: str
    auth: str


class FieldDef(ApiModel):
    name: str
    type: str
    notes: str


class EntityDef(ApiModel):
    name: str
    purpose: str
    fields: list[FieldDef]
    relationships: list[str]


class RiskItem(ApiModel):
    title: str
    impact: str
    mitigation: str


class ArchNode(ApiModel):
    id: str
    label: str
    kind: str
    implemented: bool


class ArchEdge(ApiModel):
    source: str
    target: str
    label: str | None = None
    planned: bool = False


class Architecture(ApiModel):
    mermaid: str
    nodes: list[ArchNode]
    edges: list[ArchEdge]
    implemented_summary: str
    proposed_summary: str


class ProjectMeta(ApiModel):
    generator: GeneratorName
    model: str | None = None
    llm_configured: bool = False
    simulated_agents: bool = True
    generated_at: datetime
    notes: list[str]


class Project(ApiModel):
    id: str
    title: str
    idea: str
    domain: Domain
    complexity: Complexity
    created_at: datetime
    updated_at: datetime
    status: Literal["ready"] = "ready"
    summary: str
    sections: list[Section]
    tech_stack: list[TechItem]
    api_endpoints: list[ApiEndpoint]
    database_entities: list[EntityDef]
    risks: list[RiskItem]
    next_steps: list[str]
    architecture: Architecture
    meta: ProjectMeta


class ProjectSummary(ApiModel):
    id: str
    title: str
    domain: Domain
    complexity: Complexity
    created_at: datetime
    section_count: int
    generator: GeneratorName


class ProjectList(ApiModel):
    items: list[ProjectSummary]
    count: int


class GeneratorInfo(ApiModel):
    default: str = "template"
    active: str
    llm_configured: bool


class HealthResponse(ApiModel):
    status: Literal["ok"]
    service: str
    version: str
    timestamp: datetime
    uptime_seconds: float
    projects: int
    generator: GeneratorInfo
    storage: str
