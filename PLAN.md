# ResearchHub — MVP Build Plan

Agentic AI Research & Architecture Generation System — college project MVP.

## Objective

Ship a polished, honest, demo-ready prototype with one complete workflow:
**idea → validated input → deterministic blueprint → report export → architecture diagram → session history.**

No API key required. No fake agent runs, citations, or web research.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript + Vite, React Router, Lucide, Mermaid |
| Styling | Hand-written CSS design system (Tailwind not pre-existing) |
| Backend | Python 3.12, FastAPI, Pydantic v2, Uvicorn |
| Data | In-memory, session-scoped |
| Optional LLM | Env-gated Gemini summary adapter with template fallback |

## Backend

- `GET /api/health` — service status, uptime, project count, generator mode
- `GET /api/projects` — project summaries, newest first
- `POST /api/research/generate` — validation + generation + storage (201)
- `GET /api/projects/{id}` — full project or structured 404
- Structured validation errors (`VALIDATION_ERROR` with field list)
- CORS for the local Vite origins
- Domain profiles: Healthcare, Education, Finance, E-commerce, Other
- Complexity tiers: Basic, Intermediate, Advanced
- Generator emits all 11 requested PRD sections, tech stack, API suggestions,
  database entities, risks, next steps, and an architecture graph
- Optional Gemini adapter (server-side key only, timeout + fallback)
- Pytest coverage for health, validation, generation/history, 404

## Frontend

- Dark navy UI, violet/blue gradient accents, rounded cards, responsive drawer
- Pages: Overview, New Research, Generated Documents, Report, Architecture,
  System Status, NotFound
- Overview: welcome heading, CTA, live stats, recent projects, 6 capability cards
- Report: TOC, summary, PRD sections, stack, endpoints, entities, risks, next
  steps; Copy, Download Markdown, Create Architecture
- Architecture: Mermaid diagram with implemented vs proposed legend and a
  CSS fallback if rendering fails
- Honest capability labels: Implemented / Demo-Simulated / Planned
- Loading, empty, error, and success states throughout

## Verification

1. `pytest` in a local venv
2. `npm run build` (TypeScript + Vite production build)
3. Start Uvicorn on `127.0.0.1:8000` and Vite on `127.0.0.1:5173`
4. Check health endpoint
5. Generate the hospital management sample, fetch and list it
6. Verify 11 sections, Mermaid source, and history
7. Confirm frontend serves and proxies API calls
