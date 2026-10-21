from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from ..schemas import (
    ApiEndpoint,
    ArchEdge,
    Architecture,
    ArchNode,
    EntityDef,
    FieldDef,
    GenerateResearchRequest,
    Project,
    ProjectMeta,
    RiskItem,
    Section,
    TechItem,
)
from .domain_profiles import PROFILES, DomainProfile

SCOPE = {
    "Basic": {"features": 5, "functional": 4, "non_functional": 4, "entities": 3, "endpoints": 3},
    "Intermediate": {"features": 8, "functional": 6, "non_functional": 6, "entities": 5, "endpoints": 5},
    "Advanced": {"features": 10, "functional": 9, "non_functional": 8, "entities": 7, "endpoints": 6},
}

BASE_TECH = (
    ("React + TypeScript", "Frontend", "Typed component UI used by this MVP.", "MVP"),
    ("Vite", "Build tooling", "Fast local development and production bundling.", "MVP"),
    ("Plain CSS design system", "Styling", "Custom tokens, responsive layout, and motion preferences.", "MVP"),
    ("React Router", "Routing", "Client-side navigation for the research workspace.", "MVP"),
    ("FastAPI", "Backend API", "Validated JSON endpoints and OpenAPI documentation.", "MVP"),
    ("Pydantic v2", "Validation", "Request/response schemas and field-level validation.", "MVP"),
    ("Uvicorn", "ASGI server", "Local backend runtime.", "MVP"),
    ("In-memory store", "MVP persistence", "Session-only projects, intentionally reset on restart.", "MVP"),
    ("Mermaid", "Diagramming", "Renders the proposed architecture blueprint.", "MVP"),
)

PROPOSED_PLATFORM = (
    ("PostgreSQL", "Database", "Production relational persistence and migrations.", "Proposed"),
    ("Redis", "Cache and queues", "Caching, rate limits, and background jobs.", "Proposed"),
    ("OIDC / JWT auth", "Security", "Real authentication, roles, and session policy.", "Proposed"),
    ("OpenTelemetry", "Observability", "Traces, metrics, and request correlation.", "Proposed"),
)

ARCHITECTURE_NODES = (
    ArchNode(id="user", label="User", kind="external", implemented=False),
    ArchNode(id="frontend", label="React + TypeScript Frontend", kind="ui", implemented=True),
    ArchNode(id="backend", label="FastAPI Backend", kind="api", implemented=True),
    ArchNode(id="generator", label="Deterministic Blueprint Generator", kind="service", implemented=True),
    ArchNode(id="report", label="PRD + Architecture Report", kind="output", implemented=True),
    ArchNode(id="supervisor", label="Supervisor / Workflow Orchestrator", kind="agent", implemented=False),
    ArchNode(id="research", label="Research Agent", kind="agent", implemented=False),
    ArchNode(id="rag", label="Advanced RAG Knowledge Base", kind="retrieval", implemented=False),
    ArchNode(id="technical", label="Technical Analysis Agent", kind="agent", implemented=False),
    ArchNode(id="verification", label="Verification and Guardrails", kind="verification", implemented=False),
    ArchNode(id="hitl", label="Human-in-the-Loop Review", kind="human", implemented=False),
    ArchNode(id="output", label="PRD and Architecture Output", kind="output", implemented=False),
)

ARCHITECTURE_EDGES = (
    ArchEdge(source="user", target="frontend"),
    ArchEdge(source="frontend", target="backend"),
    ArchEdge(source="backend", target="generator"),
    ArchEdge(source="generator", target="report"),
    ArchEdge(source="backend", target="supervisor", label="planned integration", planned=True),
    ArchEdge(source="supervisor", target="research", planned=True),
    ArchEdge(source="supervisor", target="rag", planned=True),
    ArchEdge(source="supervisor", target="technical", planned=True),
    ArchEdge(source="research", target="verification", planned=True),
    ArchEdge(source="rag", target="verification", planned=True),
    ArchEdge(source="technical", target="verification", planned=True),
    ArchEdge(source="verification", target="hitl", planned=True),
    ArchEdge(source="hitl", target="output", planned=True),
)

MERMAID = """flowchart LR
    U(["User"]) --> FE["React + TypeScript Frontend"]
    FE --> API["FastAPI Backend"]
    API --> GEN["Deterministic Blueprint Generator"]
    GEN --> REP["PRD + Architecture Report"]

    subgraph MVP["Implemented in this MVP"]
        FE
        API
        GEN
        REP
    end

    subgraph AGENTS["Proposed agentic pipeline (not executed)"]
        SUP["Supervisor / Workflow Orchestrator"]
        RES["Research Agent"]
        RAG["Advanced RAG Knowledge Base"]
        TECH["Technical Analysis Agent"]
        VER["Verification and Guardrails"]
        HITL["Human-in-the-Loop Review"]
        OUT["PRD and Architecture Output"]
        SUP -.-> RES
        SUP -.-> RAG
        SUP -.-> TECH
        RES -.-> VER
        RAG -.-> VER
        TECH -.-> VER
        VER -.-> HITL
        HITL -.-> OUT
    end

    API -.->|planned integration| SUP

    classDef mvp fill:#171f33,stroke:#8b5cf6,stroke-width:1.5px,color:#e8ebf3
    classDef planned fill:#0f1422,stroke:#3b4a66,stroke-width:1px,color:#9aa7bf,stroke-dasharray:5 4
    class FE,API,GEN,REP mvp
    class SUP,RES,RAG,TECH,VER,HITL,OUT planned
"""


def _pick(items, count):
    return list(items[: min(count, len(items))])


def build_architecture() -> Architecture:
    return Architecture(
        mermaid=MERMAID,
        nodes=list(ARCHITECTURE_NODES),
        edges=list(ARCHITECTURE_EDGES),
        implemented_summary=(
            "The React workspace, FastAPI endpoints, validation, deterministic blueprint "
            "generator, report exports, and Mermaid rendering actually run in this MVP."
        ),
        proposed_summary=(
            "The supervisor, research agent, advanced RAG, technical analysis, verification, "
            "human-in-the-loop review, and agent orchestration are design targets. They are "
            "not executed or connected."
        ),
    )


def _platform_technology(profile: DomainProfile, complexity: str) -> list[TechItem]:
    items = [TechItem(name=n, category=c, purpose=p, status="MVP") for n, c, p, _ in BASE_TECH]
    items.extend(
        TechItem(name=n, category=c, purpose=p, status="Proposed") for n, c, p in profile.technology
    )
    items.extend(
        TechItem(name=n, category=c, purpose=p, status=s) for n, c, p, s in PROPOSED_PLATFORM
    )
    if complexity == "Advanced":
        items.append(
            TechItem(
                name="pgvector / managed vector store",
                category="Retrieval",
                purpose="Embedding storage for a future RAG layer; not implemented today.",
                status="Proposed",
            )
        )
        items.append(
            TechItem(
                name="LLM gateway",
                category="AI",
                purpose="Provider abstraction, rate limits, and evaluation hooks; not implemented today.",
                status="Proposed",
            )
        )
    return items


def _sections(
    payload: GenerateResearchRequest,
    profile: DomainProfile,
    features: list[tuple[str, str]],
    functional: list[str],
    non_functional: list[str],
    endpoints: list[ApiEndpoint],
    entities: list[EntityDef],
    risks: list[RiskItem],
    tech: list[TechItem],
    next_steps: list[str],
) -> list[Section]:
    feature_lines = [f"{name} - {description}" for name, description in features]
    functional_lines = [f"FR-{i:02d}: {text}" for i, text in enumerate(functional, start=1)]
    non_functional_lines = [f"NFR-{i:02d}: {text}" for i, text in enumerate(non_functional, start=1)]
    endpoint_lines = [
        f"{endpoint.method} {endpoint.path} - {endpoint.purpose} (auth: {endpoint.auth})"
        for endpoint in endpoints
    ]
    entity_lines = [f"{entity.name} - {entity.purpose}" for entity in entities]
    risk_lines = [f"{risk.title}: {risk.impact} Mitigation: {risk.mitigation}" for risk in risks]
    future_scope = [
        "Production retrieval-augmented generation over approved domain documents (Planned).",
        "A single research agent with tool use and source-verified citations (Planned).",
        "A multi-agent supervisor coordinating research, technical analysis, and verification (Planned).",
        "Human-in-the-loop approval gates before architecture finalization (Planned).",
        "MCP tool connections and A2A interoperability between specialist agents (Planned).",
        "LLMOps with prompt versioning, tracing, offline evaluation, and regression gates (Planned).",
        f"Deeper integration with {profile.label.lower()} systems and partner APIs after pilot validation.",
        "Production hardening: authentication, authorization, audit retention, and load testing.",
    ]

    return [
        Section(
            key="problem_statement",
            title="Problem Statement",
            content=[
                f'Submitted idea: "{payload.idea}"',
                profile.context,
                (
                    f"The opportunity is to address this as a {payload.complexity.lower()}-complexity "
                    f"{payload.domain.lower()} initiative with a clearly bounded first release, rather "
                    "than attempting the full platform at once."
                ),
            ],
        ),
        Section(
            key="project_overview",
            title="Project Overview",
            content=[
                (
                    f"{payload.title} is proposed as a {payload.domain.lower()} platform that turns the "
                    "problem above into a coherent workflow for its primary users. The scope below is a "
                    f"{payload.complexity.lower()} blueprint with {len(features)} candidate capabilities."
                ),
                (
                    "Important boundary: ResearchHub itself only validates the idea and generates this "
                    "blueprint. The product described in this report is a design proposal and has not "
                    "been implemented."
                ),
                (
                    "The recommended first release should select one end-to-end workflow, ship it with "
                    "audit and access controls, then expand only after measured user feedback."
                ),
            ],
        ),
        Section(
            key="target_users",
            title="Target Users",
            content=[f"{item}." for item in profile.audience],
        ),
        Section(
            key="proposed_features",
            title="Proposed Features",
            content=feature_lines,
        ),
        Section(
            key="functional_requirements",
            title="Functional Requirements",
            content=functional_lines,
        ),
        Section(
            key="non_functional_requirements",
            title="Non-Functional Requirements",
            content=non_functional_lines,
        ),
        Section(
            key="technology_stack",
            title="Suggested Technology Stack",
            content=[
                (
                    "The running MVP uses React, TypeScript, Vite, custom CSS, FastAPI, Pydantic, "
                    "an in-memory store, and Mermaid. Those items are labeled MVP in the stack table."
                ),
                (
                    "The domain database, identity, integration, and observability choices are "
                    "recommendations for a production build. They are labeled Proposed and are not "
                    "installed or connected in this demo."
                ),
                f"The stack contains {len(tech)} items across {len({item.category for item in tech})} categories.",
            ],
        ),
        Section(
            key="api_design",
            title="API Design Suggestions",
            content=[
                (
                    "Design proposal only: none of the endpoints below are implemented by ResearchHub. "
                    "They describe a versioned REST API for the proposed product."
                ),
                (
                    "Use consistent JSON envelopes, cursor or page-based pagination, idempotency keys "
                    "for unsafe retries, and field-level validation errors."
                ),
                *endpoint_lines,
                (
                    "Protect domain resources with OIDC/JWT authentication, role-based authorization, "
                    "rate limiting, and audit logging. Document the contract with OpenAPI."
                ),
            ],
        ),
        Section(
            key="database_entities",
            title="Database Entities",
            content=[
                (
                    f"The proposed domain model starts with {len(entities)} entities. Each entity has "
                    "a stable UUID key, created/updated timestamps, and explicit tenant or ownership "
                    "boundaries where needed."
                ),
                *entity_lines,
                (
                    "Add migrations, foreign-key constraints, and indexes for the identified access "
                    "patterns before production use."
                ),
            ],
        ),
        Section(
            key="risks",
            title="Risks and Limitations",
            content=[
                *risk_lines,
                (
                    "MVP limitation: this report is generated from deterministic templates. It performs "
                    "no web research, no retrieval, no LLM call by default, and no agent execution. "
                    "Every architecture and API item must be reviewed by a human before implementation."
                ),
            ],
        ),
        Section(
            key="future_scope",
            title="Future Scope",
            content=future_scope,
        ),
    ]


def build_project(payload: GenerateResearchRequest) -> Project:
    profile = PROFILES[payload.domain]
    scope = SCOPE[payload.complexity]

    features = _pick(profile.features, scope["features"])
    functional = _pick(profile.functional, scope["functional"])
    functional.append(
        "The system shall expose a versioned REST API with consistent errors, pagination, and authorization checks."
    )
    if payload.complexity == "Advanced":
        functional.append(
            "The system shall support integration contracts with external systems through signed webhooks."
        )
    functional = functional[: scope["functional"] + 1]

    non_functional = _pick(profile.non_functional, scope["non_functional"])
    non_functional.append(
        "The delivery pipeline shall include automated tests, dependency scanning, and a rollback plan."
    )
    non_functional = non_functional[: scope["non_functional"]]

    endpoints = [
        ApiEndpoint(method=m, path=p, purpose=u, auth=a)
        for m, p, u, a in _pick(profile.endpoints, scope["endpoints"])
    ]
    entities = [
        EntityDef(
            name=e.name,
            purpose=e.purpose,
            fields=[FieldDef(name=n, type=t, notes=d) for n, t, d in e.fields],
            relationships=list(e.relationships),
        )
        for e in _pick(profile.entities, scope["entities"])
    ]
    tech = _platform_technology(profile, payload.complexity)

    risks = [
        RiskItem(title=r.title, impact=r.impact, mitigation=r.mitigation) for r in profile.risks
    ]
    risks.extend(
        [
            RiskItem(
                title="Template-only blueprint quality",
                impact=(
                    "Medium: the MVP output is structured but generic and may miss domain nuance."
                ),
                mitigation=(
                    "Validate every section with domain experts, add source-grounded LLM/RAG support "
                    "behind evaluation gates, and keep a human approval step."
                ),
            ),
            RiskItem(
                title="Session-only MVP storage",
                impact=(
                    "Low for a demo: refreshing the backend process removes all generated projects."
                ),
                mitigation=(
                    "This is intentional for the MVP. Add a production database and migrations before "
                    "using the system for real project records."
                ),
            ),
            RiskItem(
                title="Security baseline is incomplete",
                impact=(
                    "Medium: the MVP has validation and safe rendering, but no authentication, roles, "
                    "or persistent audit trail."
                ),
                mitigation=(
                    "Add OIDC authentication, authorization, rate limiting, dependency scanning, and "
                    "immutable audit logging before handling sensitive data."
                ),
            ),
        ]
    )

    next_steps = [
        "Review the problem statement, target users, and scope with 3-5 domain experts or users.",
        "Choose one end-to-end workflow for the first release and defer the remaining features explicitly.",
        "Convert the proposed API endpoints and entities into user stories with acceptance tests.",
        "Add authentication, authorization, and audit logging before handling real user data.",
        "Replace the in-memory MVP store with a production database and migration pipeline.",
        "If AI assistance is needed, add a provider adapter and retrieval only behind evaluation and human review.",
    ]

    now = datetime.now(timezone.utc)
    project_id = f"prj_{uuid4().hex[:12]}"
    sections = _sections(
        payload, profile, features, functional, non_functional, endpoints, entities, risks, tech, next_steps
    )

    article = "An" if payload.complexity[0].lower() in "aeiou" else "A"
    summary = (
        f"{article} {payload.complexity.lower()}-complexity {payload.domain.lower()} blueprint for "
        f"{payload.title}. It defines {len(features)} candidate features, {len(functional)} functional "
        f"requirements, a proposed {len(tech)}-item stack, {len(endpoints)} API endpoints, "
        f"{len(entities)} database entities, and the key delivery risks. Everything here is a design "
        "proposal generated from deterministic templates - no web research or agent execution occurred."
    )

    return Project(
        id=project_id,
        title=payload.title,
        idea=payload.idea,
        domain=payload.domain,
        complexity=payload.complexity,
        created_at=now,
        updated_at=now,
        summary=summary,
        sections=sections,
        tech_stack=tech,
        api_endpoints=endpoints,
        database_entities=entities,
        risks=risks,
        next_steps=next_steps,
        architecture=build_architecture(),
        meta=ProjectMeta(
            generator="template",
            llm_configured=False,
            simulated_agents=True,
            generated_at=now,
            notes=[
                "Generated deterministically from the submitted idea; no web research or agent execution was performed.",
                "API, database, and technology suggestions are design proposals, not implemented functionality.",
                "The MVP stores projects in memory only; restarting the backend clears the session.",
            ],
        ),
    )
