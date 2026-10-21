import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Bot,
  Check,
  Clock3,
  FileText,
  Layers3,
  Network,
  Plug,
  Plus,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { CapabilityCard } from "../components/CapabilityCard";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { ListSkeleton } from "../components/Loading";
import { StatCard } from "../components/StatCard";
import { useHealth, useResource } from "../hooks/useApi";
import { listProjects } from "../lib/api";
import { DASHBOARD_CAPABILITY_IDS, capabilityById } from "../lib/capabilities";
import { relativeTime } from "../lib/format";

const CAPABILITY_ICONS = {
  rag: BookOpenCheck,
  "single-agent": Bot,
  mcp: Plug,
  a2a: Network,
  guardrails: ShieldCheck,
  llmops: Activity,
};

const PREVIEW_ROWS = ["Problem & target users", "Requirements & features", "API & data model", "Risks & architecture"];

export function Overview() {
  const projects = useResource(listProjects, []);
  const health = useHealth(60_000);
  const items = projects.data?.items ?? [];
  const count = projects.data?.count ?? 0;
  const recent = items.slice(0, 4);

  return (
    <div className="page overview-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            Agentic research workspace
          </span>
          <h1>
            Turn your idea into a <span className="text-gradient">development-ready blueprint.</span>
          </h1>
          <p className="hero-description">
            Describe a problem, choose your domain and complexity, and ResearchHub will structure a
            complete research brief, requirements set, technology proposal, and architecture direction.
          </p>
          <div className="hero-actions">
            <Link to="/new" className="btn btn-primary">
              <Plus size={17} aria-hidden="true" />
              New research
            </Link>
            <Link to="/projects" className="btn btn-secondary">
              View generated documents
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="hero-trust">
            <span>
              <ShieldCheck size={14} aria-hidden="true" />
              Honest capability labels
            </span>
            <span>
              <Layers3 size={14} aria-hidden="true" />
              11 structured sections
            </span>
            <span>
              <Workflow size={14} aria-hidden="true" />
              No API key required
            </span>
          </div>
        </div>

        <div className="hero-preview" aria-hidden="true">
          <div className="preview-top">
            <div className="preview-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="preview-label">Blueprint preview</span>
          </div>
          <div className="preview-body">
            <div className="preview-meta">
              <span className="tag tag-violet">Healthcare</span>
              <span className="tag">Intermediate</span>
            </div>
            <strong className="preview-title">CareFlow Hospital Platform</strong>
            <p className="preview-copy">
              Appointments, records, diagnostics, and doctor workflows in one coherent proposal.
            </p>
            <div className="preview-rows">
              {PREVIEW_ROWS.map((row) => (
                <div className="preview-row" key={row}>
                  <span className="preview-check">
                    <Check size={11} aria-hidden="true" />
                  </span>
                  <span>{row}</span>
                  <span className="preview-bar" />
                </div>
              ))}
            </div>
            <div className="preview-footer">
              <span className="preview-pulse" />
              Proposed architecture &middot; not executed
            </div>
          </div>
          <div className="preview-float">
            <FileText size={15} aria-hidden="true" />
            <div>
              <strong>Export-ready</strong>
              <span>Markdown + diagram</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Workspace metrics">
        <StatCard
          label="Research Projects"
          value={String(count)}
          hint="This backend session"
          icon={Layers3}
          loading={projects.loading}
          tone="violet"
        />
        <StatCard
          label="Generated PRDs"
          value={String(count)}
          hint="11 sections per blueprint"
          icon={FileText}
          loading={projects.loading}
          tone="blue"
        />
        <StatCard
          label="Architecture Diagrams"
          value={String(count)}
          hint="Mermaid flowcharts"
          icon={Workflow}
          loading={projects.loading}
          tone="cyan"
        />
        <StatCard
          label="System Status"
          value={health.error ? "Offline" : health.loading ? "Checking" : "Online"}
          hint={health.error ? "Start the FastAPI backend" : "FastAPI health check"}
          icon={Activity}
          loading={health.loading && !health.error}
          tone="emerald"
        />
      </section>

      <div className="overview-columns">
        <section className="panel recent-panel">
          <div className="panel-head">
            <div>
              <h2>Recent projects</h2>
              <p>Blueprints generated during this session.</p>
            </div>
            <Link to="/projects" className="text-link">
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {projects.loading ? (
            <ListSkeleton rows={3} />
          ) : projects.error ? (
            <ErrorState
              title="Could not load projects"
              message={projects.error.message}
              onRetry={projects.reload}
            />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={<FileText size={23} aria-hidden="true" />}
              title="No research projects yet"
              description="Start with one clear idea. Your generated blueprint, architecture proposal, and export will appear here."
              actionLabel="Create your first blueprint"
              actionTo="/new"
            />
          ) : (
            <div className="recent-list">
              {recent.map((project) => (
                <Link to={`/projects/${project.id}`} className="recent-row" key={project.id}>
                  <span className="recent-icon">
                    <FileText size={17} aria-hidden="true" />
                  </span>
                  <span className="recent-main">
                    <strong>{project.title}</strong>
                    <span>
                      {project.domain} &middot; {project.complexity} &middot; {project.sectionCount} sections
                    </span>
                  </span>
                  <span className="recent-time">
                    <Clock3 size={12} aria-hidden="true" />
                    {relativeTime(project.createdAt)}
                  </span>
                  <ArrowUpRight size={16} className="recent-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel workflow-panel">
          <div className="panel-head">
            <div>
              <h2>One complete workflow</h2>
              <p>What actually runs in this MVP.</p>
            </div>
            <span className="tag tag-emerald">Implemented</span>
          </div>
          <ol className="workflow-steps">
            <li>
              <span>01</span>
              <div>
                <strong>Describe the idea</strong>
                <p>Validated title, problem statement, domain, and complexity.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Generate the blueprint</strong>
                <p>Deterministic domain templates produce 11 structured sections.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Review, export, diagram</strong>
                <p>Copy or download Markdown and open the proposed architecture.</p>
              </div>
            </li>
          </ol>
          <p className="workflow-note">
            No LLM is called by default. No agents execute. The proposed pipeline is shown as a design,
            never as a running system.
          </p>
        </section>
      </div>

      <section className="capability-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Capability map</span>
            <h2>Built honestly, labeled clearly.</h2>
            <p>Every capability below reflects the current codebase, not the ambition of the project.</p>
          </div>
          <Link to="/status" className="text-link">
            Full system status
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="capability-grid">
          {DASHBOARD_CAPABILITY_IDS.map((id) => (
            <CapabilityCard
              key={id}
              capability={capabilityById(id)}
              icon={CAPABILITY_ICONS[id as keyof typeof CAPABILITY_ICONS] ?? Sparkles}
            />
          ))}
        </div>
      </section>

      <section className="honesty-banner">
        <span className="honesty-icon">
          <ShieldCheck size={19} aria-hidden="true" />
        </span>
        <div>
          <strong>No simulated intelligence presented as real.</strong>
          <p>
            This MVP uses deterministic templates and session-only storage. Advanced RAG, agents, MCP,
            A2A, human approval, and LLMOps are planned, not working features.
          </p>
        </div>
        <Link to="/status" className="btn btn-ghost btn-sm">
          Read the status
        </Link>
      </section>
    </div>
  );
}
