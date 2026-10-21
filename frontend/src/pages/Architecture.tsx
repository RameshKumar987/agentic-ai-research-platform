import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  FileText,
  Layers3,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { SkeletonPage } from "../components/Loading";
import { MermaidDiagram } from "../components/MermaidDiagram";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useResource } from "../hooks/useApi";
import { getProject, listProjects } from "../lib/api";
import { formatDate } from "../lib/format";

export function ArchitecturePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const projects = useResource(listProjects, []);
  const items = projects.data?.items ?? [];
  const selectedId = id ?? items[0]?.id ?? null;
  const projectResource = useResource(
    () => (selectedId ? getProject(selectedId) : Promise.resolve(null)),
    [selectedId],
  );
  const project = projectResource.data;

  if (projects.loading) return <SkeletonPage cards={2} />;

  if (projects.error) {
    return (
      <div className="page">
        <ErrorState
          title="Could not load your projects"
          message={projects.error.message}
          onRetry={projects.reload}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page architecture-page">
        <PageHeader
          eyebrow="System design"
          title="Architecture blueprint"
          description="Turn a generated research blueprint into a clear implementation view."
        />
        <div className="panel">
          <EmptyState
            icon={<Workflow size={24} aria-hidden="true" />}
            title="No architecture to visualize yet"
            description="Generate a blueprint first. Its proposed components, boundaries, and planned agent pipeline will become a Mermaid diagram here."
            actionLabel="Create a blueprint"
            actionTo="/new"
          />
        </div>
      </div>
    );
  }

  if (projectResource.loading) return <SkeletonPage cards={2} />;

  if (projectResource.error || !project) {
    return (
      <div className="page">
        <ErrorState
          title="Architecture unavailable"
          message={
            projectResource.error?.message ??
            "That project is not available in this backend session."
          }
          onRetry={projectResource.reload}
          backTo={{ label: "Back to documents", to: "/projects" }}
        />
      </div>
    );
  }

  return (
    <div className="page architecture-page">
      <PageHeader
        eyebrow="System design"
        title="Architecture blueprint"
        description="A visual proposal built from the selected blueprint. Solid components run in this MVP; dashed components are planned and are not executed."
        actions={
          <Link to={`/projects/${project.id}`} className="btn btn-secondary">
            <FileText size={16} aria-hidden="true" />
            Open report
          </Link>
        }
      />

      <div className="arch-toolbar">
        <label className="select-field">
          <span>Project</span>
          <select
            value={project.id}
            onChange={(event) => navigate(`/architecture/${event.target.value}`)}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <div className="arch-meta">
          <span className="tag">{project.domain}</span>
          <span className="tag">{project.complexity}</span>
          <span className="arch-date">Generated {formatDate(project.createdAt)}</span>
        </div>
      </div>

      <section className="panel diagram-panel">
        <div className="panel-head diagram-head">
          <div>
            <span className="eyebrow">Proposed architecture</span>
            <h2>{project.title}</h2>
            <p>Rendered with Mermaid. This is a design diagram, not execution telemetry.</p>
          </div>
          <div className="diagram-head-right">
            <span className="tag tag-emerald">
              <span className="badge-dot" aria-hidden="true" />
              Blueprint ready
            </span>
            <span className="tag">Not executed</span>
          </div>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-swatch legend-implemented" aria-hidden="true" />
            Implemented in this MVP
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-proposed" aria-hidden="true" />
            Proposed / not executed
          </span>
          <span className="legend-item legend-muted">
            <Network size={13} aria-hidden="true" />
            Agent flow shown for design only
          </span>
        </div>

        <MermaidDiagram architecture={project.architecture} />
      </section>

      <div className="arch-summary-grid">
        <section className="panel arch-summary-card">
          <span className="arch-summary-icon arch-summary-implemented">
            <CheckCircle2 size={18} aria-hidden="true" />
          </span>
          <div>
            <h2>Implemented in this MVP</h2>
            <p>{project.architecture.implementedSummary}</p>
          </div>
        </section>
        <section className="panel arch-summary-card">
          <span className="arch-summary-icon arch-summary-proposed">
            <CircleDashed size={18} aria-hidden="true" />
          </span>
          <div>
            <h2>Proposed, not executed</h2>
            <p>{project.architecture.proposedSummary}</p>
          </div>
        </section>
      </div>

      <section className="panel arch-components">
        <div className="panel-head">
          <div>
            <h2>Component inventory</h2>
            <p>How each part of the diagram should be read.</p>
          </div>
          <span className="tag">
            <Layers3 size={12} aria-hidden="true" />
            {project.architecture.nodes.length} components
          </span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Layer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {project.architecture.nodes.map((node) => (
                <tr key={node.id}>
                  <td className="cell-strong">{node.label}</td>
                  <td>
                    <span className="capitalize">{node.kind}</span>
                  </td>
                  <td>
                    {node.implemented ? (
                      <StatusBadge status="Implemented" />
                    ) : (
                      <StatusBadge status="Planned" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="honesty-banner">
        <span className="honesty-icon">
          <ShieldCheck size={19} aria-hidden="true" />
        </span>
        <div>
          <strong>Diagram boundaries are explicit.</strong>
          <p>
            The supervisor, research agent, RAG layer, technical analysis, verification, and
            human-in-the-loop review are design targets. No agent orchestration or retrieval runs in
            this project.
          </p>
        </div>
        <Link to={`/projects/${project.id}`} className="btn btn-ghost btn-sm">
          Review the report
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
