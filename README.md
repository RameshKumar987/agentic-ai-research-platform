# ResearchHub

**Agentic AI Research and Architecture Generation System** — a polished MVP that turns a project idea into a structured, development-ready blueprint and a proposed architecture diagram.

> Built as a college project prototype. The workflow is real; advanced agentic AI is honestly labeled as planned.

## What works

- Guided research intake with server + client validation
- Deterministic blueprint generation across 11 PRD sections
- Domain-aware output for Healthcare, Education, Finance, E-commerce, and Other
- Complexity-aware scope (Basic, Intermediate, Advanced)
- Technology stack, proposed API design, database entities, risks, and next steps
- Report copy and Markdown download using native browser APIs
- Mermaid architecture diagram with an explicit implemented vs proposed legend
- Session project history and document search/filter
- Live backend health, uptime, generator mode, and capability matrix
- Responsive dark UI with loading, empty, error, and success states
- Backend tests and a production frontend build

## Honest capability status

| Capability | Status | Notes |
| --- | --- | --- |
| Research-to-blueprint workflow | Implemented | Deterministic domain templates |
| Input validation + structured errors | Implemented | Pydantic + custom error envelope |
| Report copy / Markdown download | Implemented | Clipboard API + Blob download |
| Architecture visualization | Implemented | Mermaid render of a proposed design |
| Project history | Implemented | In-memory, cleared on backend restart |
| LLM integration | Demo / optional | Gemini summary adapter, env-gated, template fallback |
| Advanced RAG | Planned | No vector store or retrieval is running |
| Single agent / multi-agent supervisor | Planned | Diagram only; no execution |
| Human-in-the-loop approval | Planned | No approval workflow |
| MCP tools / A2A communication | Planned | Not connected |
| LLMOps and evaluation | Planned | No tracing or eval pipeline |
| Production guardrails | Partial | Basic validation and safe rendering only |

The default demo **requires no API key** and makes **no LLM, web research, or agent calls**.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Lucide, Mermaid |
| Styling | Hand-written CSS design system |
| Backend | Python 3.12, FastAPI, Pydantic v2, Uvicorn |
| Storage | In-memory (session only) |
| Tests | Pytest + FastAPI TestClient |

## Run locally (Windows PowerShell)

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (new terminal)

```powershell
cd frontend
npm install
npm run dev
```

### URLs

- Frontend: **http://127.0.0.1:5173**
- Backend: **http://127.0.0.1:8000**
- API docs: **http://127.0.0.1:8000/docs**
- Health: **http://127.0.0.1:8000/api/health**

## Verify

```powershell
cd backend
.\.venv\Scripts\python -m pytest -q

cd ..\frontend
npm run build
```

Sample idea used during development:

> An AI-powered hospital management platform that manages appointments, patient records, diagnostics, and doctor workflows.

Try it at **New Research** with domain **Healthcare** and complexity **Intermediate**.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service status, uptime, generator mode, project count |
| GET | `/api/projects` | Newest-first project summaries |
| POST | `/api/research/generate` | Validate + generate + store a blueprint |
| GET | `/api/projects/{project_id}` | Full project or structured 404 |

Generate request:

```json
{
  "title": "CareFlow Hospital Platform",
  "idea": "An AI-powered hospital management platform that manages appointments, patient records, diagnostics, and doctor workflows.",
  "domain": "Healthcare",
  "complexity": "Intermediate"
}
```

Errors use a consistent envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields and try again.",
    "fields": [{ "field": "title", "message": "..." }]
  }
}
```

## Optional Gemini adapter

Copy `.env.example` to `.env`, then set:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```

When configured, Gemini only rewrites the report summary. Sections, APIs, entities, risks, and the diagram remain deterministic template output. Any failure falls back to the template. The key stays server-side and is never exposed to the frontend.

## Project structure

```text
ResearchHub/
├─ backend/
│  ├─ app/
│  │  ├─ main.py              # CORS, error handlers, routers
│  │  ├─ schemas.py           # Pydantic request/response models
│  │  ├─ store.py             # Thread-safe in-memory project store
│  │  ├─ routers/             # health, projects, research
│  │  └─ services/            # domain profiles, generator, optional LLM
│  └─ tests/test_api.py
├─ frontend/
│  └─ src/
│     ├─ pages/               # Overview, NewResearch, Documents, Report,
│     │                       # Architecture, SystemStatus
│     ├─ components/          # layout, Mermaid, badges, states, toasts
│     ├─ lib/                 # API client, types, Markdown export
│     └─ styles.css           # design system
├─ PLAN.md
└─ .env.example
```

## Known limitations

- Projects are stored in backend memory and disappear when Uvicorn restarts.
- No authentication, authorization, database, or audit persistence.
- Generated content is template-based and must be reviewed by domain experts.
- Architecture, RAG, agents, MCP, A2A, HITL, and LLMOps are design targets, not runtime features.
- Clipboard copy depends on browser permissions; Markdown download is the fallback.
