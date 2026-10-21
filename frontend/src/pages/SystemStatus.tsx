import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  ExternalLink,
  Network,
  Plug,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  UserCheck,
  Waypoints,
} from "lucide-react";
import { CapabilityCard } from "../components/CapabilityCard";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useHealth } from "../hooks/useApi";
import { CAPABILITIES } from "../lib/capabilities";
import { formatDateTime, generatorLabel } from "../lib/format";

const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  llm: BrainCircuit,
  rag: BookOpenCheck,
  "single-agent": Bot,
  "multi-agent": Network,
  hitl: UserCheck,
  guardrails: ShieldCheck,
  mcp: Plug,
  a2a: Waypoints,
  llmops: Activity,
};

const ENDPOINTS = [
  { method: "GET", path: "/api/health", purpose: "Service status, uptime, generator mode, and session project count." },
  { method: "GET", path: "/api/projects", purpose: "List generated project summaries, newest first." },
  { method: "POST", path: "/api/research/generate", purpose: "Validate input, generate the blueprint, and store it in memory." },
  { method: "GET", path: "/api/projects/{projectId}", purpose: "Fetch one complete project or a structured 404 error." },
];

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function docsUrl(): string {
  const configured = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return configured ? `${configured}/docs` : "http://127.0.0.1:8000/docs";
}

export function SystemStatus() {
  const health = useHealth(15_000);

  return (
    <div className="page status-page">
      <PageHeader
        eyebrow="Runtime transparency"
        title="System status"
        description="A live view of what the backend is doing, what is stubbed, and what is intentionally out of scope."
        actions={
          <button type="button" className="btn btn-secondary" onClick={health.reload} disabled={health.loading}>
            <RefreshCw size={15} className={health.loading ? "spin" : undefined} aria-hidden="true" />
            {health.loading ? "Checking" : "Refresh"}
          </button>
        }
      />

      {health.error ? (
        <section className="panel offline-panel">
          <div className="offline-head">
            <span className="status-orb status-orb-offline" aria-hidden="true" />
            <div>
              <span className="eyebrow">Connection failed</span>
              <h2>The API is offline</h2>
              <p>{health.error.message}</p>
            </div>
            <StatusBadge status="Offline" />
          </div>
          <div className="terminal-block">
            <Terminal size={16} aria-hidden="true" />
            <code>cd backend; .\.venv\Scripts\uvicorn app.main:app --reload --port 8000</code>
          </div>
          <p className="offline-hint">
            Start the backend, then press Refresh. The frontend proxy expects it on port 8000.
          </p>
        </section>
      ) : (
        <section className="panel status-hero">
          <div className="status-hero-head">
            <span className={`status-orb ${health.loading ? "status-orb-loading" : ""}`} aria-hidden="true" />
            <div>
              <span className="eyebrow">Live health check</span>
              <h2>{health.loading ? "Checking the API..." : "All systems operational"}</h2>
              <p>
                {health.loading
                  ? "Waiting for the FastAPI backend."
                  : "FastAPI is reachable, validation is active, and the in-memory store is available."}
              </p>
            </div>
            <StatusBadge status="Online" />
          </div>

          <div className="status-metrics">
            <div>
              <span>Service</span>
              <strong>{health.data?.service ?? "ResearchHub API"}</strong>
            </div>
            <div>
              <span>Version</span>
              <strong>v{health.data?.version ?? "0.1.0"}</strong>
            </div>
            <div>
              <span>Uptime</span>
              <strong>{health.data ? formatUptime(health.data.uptimeSeconds) : "--"}</strong>
            </div>
            <div>
              <span>Session projects</span>
              <strong>{health.data?.projects ?? 0}</strong>
            </div>
            <div>
              <span>Generator</span>
              <strong>{generatorLabel(health.data?.generator.active ?? "template")}</strong>
            </div>
            <div>
              <span>Last checked</span>
              <strong>{health.data ? formatDateTime(health.data.timestamp) : "--"}</strong>
            </div>
          </div>

          <div className="status-foot">
            <span>
              <Server size={14} aria-hidden="true" />
              Storage: {health.data?.storage ?? "in-memory"}
            </span>
            <span>
              <ShieldCheck size={14} aria-hidden="true" />
              LLM configured: {health.data?.generator.llmConfigured ? "Yes" : "No"}
            </span>
            <span>
              <Bot size={14} aria-hidden="true" />
              Agent execution: not implemented
            </span>
          </div>
        </section>
      )}

      <section className="status-section">
        <div className="section-heading section-heading-tight">
          <div>
            <span className="eyebrow">Capability matrix</span>
            <h2>What is real, simulated, or planned</h2>
            <p>Labels are based on the current codebase. A planned capability has no runtime behind it.</p>
          </div>
        </div>
        <div className="capability-grid capability-grid-status">
          {CAPABILITIES.map((capability) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              icon={CAPABILITY_ICONS[capability.id] ?? Activity}
            />
          ))}
        </div>
      </section>

      <div className="status-two-column">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Implemented API surface</h2>
              <p>Four endpoints, all live in this demo.</p>
            </div>
            <a className="text-link" href={docsUrl()} target="_blank" rel="noreferrer">
              OpenAPI docs
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
          <div className="table-scroll">
            <table className="data-table endpoint-status-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((endpoint) => (
                  <tr key={endpoint.path}>
                    <td>
                      <span className={`method method-${endpoint.method.toLowerCase()}`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td>
                      <code>{endpoint.path}</code>
                    </td>
                    <td>{endpoint.purpose}</td>
                    <td>
                      <StatusBadge status="Implemented" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel legend-panel">
          <div className="panel-head">
            <div>
              <h2>Reading the labels</h2>
              <p>No feature is presented as more than it is.</p>
            </div>
          </div>
          <div className="label-explainer">
            <div>
              <StatusBadge status="Implemented" />
              <p>
                Working code you can exercise now: validation, generation, exports, history, and the
                health endpoint.
              </p>
            </div>
            <div>
              <StatusBadge status="Demo/Simulated" />
              <p>
                Visible behavior without production capability. The optional Gemini summary adapter and
                architecture visualization fall here.
              </p>
            </div>
            <div>
              <StatusBadge status="Planned" />
              <p>
                A design target with no execution path: RAG, agents, MCP, A2A, approval workflows, and
                LLMOps.
              </p>
            </div>
          </div>
          <div className="session-note">
            <strong>Session-only data</strong>
            <p>
              Projects live in backend memory. Restarting the Uvicorn process clears the document
              library, which is intentional for this MVP.
            </p>
            <Link to="/new" className="btn btn-ghost btn-sm">
              Generate a test blueprint
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
