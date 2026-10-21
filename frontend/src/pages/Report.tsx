import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Copy,
  Database,
  Download,
  FileText,
  Gauge,
  Layers3,
  ListChecks,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import { ErrorState } from "../components/EmptyState";
import { ReportSkeleton } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import { useResource } from "../hooks/useApi";
import { getProject } from "../lib/api";
import { formatDateTime, generatorLabel } from "../lib/format";
import { copyText, downloadMarkdown, projectToMarkdown } from "../lib/report";
import type { Project, Section } from "../lib/types";

const SECTION_ICONS: Record<string, LucideIcon> = {
  problem_statement: Target,
  project_overview: BookOpen,
  target_users: Users,
  proposed_features: Sparkles,
  functional_requirements: ListChecks,
  non_functional_requirements: Gauge,
  technology_stack: Layers3,
  api_design: Server,
  database_entities: Database,
  risks: AlertTriangle,
  future_scope: ShieldCheck,
};

const TOC_ITEMS = [
  { id: "summary", label: "Summary" },
  { id: "section-problem_statement", label: "Problem statement" },
  { id: "section-project_overview", label: "Project overview" },
  { id: "section-target_users", label: "Target users" },
  { id: "section-proposed_features", label: "Proposed features" },
  { id: "section-functional_requirements", label: "Functional requirements" },
  { id: "section-non_functional_requirements", label: "Non-functional requirements" },
  { id: "section-technology_stack", label: "Technology stack" },
  { id: "section-api_design", label: "API design" },
  { id: "section-database_entities", label: "Database entities" },
  { id: "section-risks", label: "Risks and limitations" },
  { id: "section-future_scope", label: "Future scope" },
  { id: "next-steps", label: "Next steps" },
  { id: "architecture", label: "Architecture" },
];

export function Report() {
  const { id } = useParams<{ id: string }>();
  const projectResource = useResource(
    () => (id ? getProject(id) : Promise.reject(new Error("No project id provided."))),
    [id],
  );
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const project = projectResource.data;

  async function handleCopy(current: Project) {
    try {
      await copyText(projectToMarkdown(current));
      setCopied(true);
      addToast("Full report copied to the clipboard.", "success");
      window.setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not copy the report.", "error");
    }
  }

  function handleDownload(current: Project) {
    try {
      downloadMarkdown(current);
      addToast("Markdown download started.", "success");
    } catch {
      addToast("The download could not start. Check your browser download settings.", "error");
    }
  }

  if (projectResource.loading) return <ReportSkeleton />;

  if (projectResource.error || !project) {
    return (
      <div className="page">
        <ErrorState
          title="Blueprint not found"
          message={
            projectResource.error?.message ??
            "This project is not available in the current backend session."
          }
          onRetry={projectResource.reload}
          backTo={{ label: "Back to documents", to: "/projects" }}
        />
      </div>
    );
  }

  return (
    <div className="page report-page">
      <div className="report-topbar">
        <Link to="/projects" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Generated documents
        </Link>
        <div className="report-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleCopy(project)}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? "Copied" : "Copy report"}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleDownload(project)}
          >
            <Download size={15} aria-hidden="true" />
            Download .md
          </button>
          <Link to={`/architecture/${project.id}`} className="btn btn-primary btn-sm">
            <Workflow size={15} aria-hidden="true" />
            Create architecture diagram
          </Link>
        </div>
      </div>

      <header className="report-header">
        <div className="report-tags">
          <span className={`tag domain-tag domain-${project.domain.toLowerCase().replace(/[^a-z]/g, "")}`}>
            {project.domain}
          </span>
          <span className="tag">{project.complexity}</span>
          <span className="tag tag-emerald">
            <span className="badge-dot" aria-hidden="true" />
            Blueprint ready
          </span>
        </div>
        <h1>{project.title}</h1>
        <p className="report-idea">&ldquo;{project.idea}&rdquo;</p>
        <div className="report-meta-row">
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            {formatDateTime(project.meta.generatedAt)}
          </span>
          <span>
            <FileText size={14} aria-hidden="true" />
            {project.sections.length} PRD sections
          </span>
          <span>
            <Sparkles size={14} aria-hidden="true" />
            {generatorLabel(project.meta.generator)}
          </span>
          <span>
            <ShieldCheck size={14} aria-hidden="true" />
            Agents not executed
          </span>
        </div>
      </header>

      <div className="report-layout">
        <aside className="report-aside">
          <nav className="report-toc" aria-label="Report contents">
            <span className="toc-label">On this page</span>
            {TOC_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="toc-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="panel report-info-card">
            <h2>Document details</h2>
            <dl>
              <div>
                <dt>Project ID</dt>
                <dd className="mono">{project.id}</dd>
              </div>
              <div>
                <dt>Domain</dt>
                <dd>{project.domain}</dd>
              </div>
              <div>
                <dt>Complexity</dt>
                <dd>{project.complexity}</dd>
              </div>
              <div>
                <dt>Blueprint engine</dt>
                <dd>{generatorLabel(project.meta.generator)}</dd>
              </div>
              <div>
                <dt>Agents executed</dt>
                <dd>No</dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd>This backend session</dd>
              </div>
            </dl>
            <p className="info-card-note">Restarting the backend clears this document.</p>
          </div>
        </aside>

        <article className="report-content">
          <section className="panel summary-card" id="summary">
            <div className="summary-head">
              <div>
                <span className="eyebrow">Executive summary</span>
                <h2>Blueprint at a glance</h2>
              </div>
              <span className="summary-mark">
                <Sparkles size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="summary-text">{project.summary}</p>
            <div className="summary-stats">
              <span>
                <strong>{project.sections.length}</strong> sections
              </span>
              <span>
                <strong>{project.techStack.length}</strong> stack items
              </span>
              <span>
                <strong>{project.apiEndpoints.length}</strong> API endpoints
              </span>
              <span>
                <strong>{project.databaseEntities.length}</strong> entities
              </span>
            </div>
          </section>

          <div className="honesty-strip">
            <ShieldCheck size={17} aria-hidden="true" />
            <p>
              Generated from deterministic domain templates. No web research, LLM call, or agent
              execution happened. Treat this as a reviewed starting point, not a verified design.
            </p>
          </div>

          {project.sections.map((section, index) => (
            <ReportSection
              key={section.key}
              section={section}
              index={index}
              project={project}
            />
          ))}

          <section className="panel report-section" id="next-steps">
            <div className="report-section-head">
              <span className="section-number">12</span>
              <div>
                <h2>Next Steps</h2>
                <p>Recommended path from blueprint to a safe first release.</p>
              </div>
            </div>
            <ol className="next-steps">
              {project.nextSteps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel architecture-preview" id="architecture">
            <div className="report-section-head">
              <span className="section-number">13</span>
              <div>
                <h2>Proposed Architecture</h2>
                <p>Implemented MVP scope and the planned agentic pipeline.</p>
              </div>
            </div>
            <div className="architecture-preview-grid">
              <div className="arch-preview-block arch-preview-now">
                <span className="arch-preview-label">Implemented now</span>
                <p>{project.architecture.implementedSummary}</p>
              </div>
              <div className="arch-preview-block arch-preview-later">
                <span className="arch-preview-label">Proposed, not executed</span>
                <p>{project.architecture.proposedSummary}</p>
              </div>
            </div>
            <div className="arch-preview-flow" aria-label="High-level proposed flow">
              {["User", "React frontend", "FastAPI backend", "Template generator", "PRD + architecture"].map(
                (step, index, all) => (
                  <span key={step} className="arch-flow-item">
                    <span className="arch-flow-node">{step}</span>
                    {index < all.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
                  </span>
                ),
              )}
            </div>
            <Link to={`/architecture/${project.id}`} className="btn btn-primary">
              <Workflow size={16} aria-hidden="true" />
              Open full architecture diagram
            </Link>
          </section>

          <footer className="report-disclaimer">
            <strong>Scope reminder</strong>
            <p>
              ResearchHub generated this document from your inputs using deterministic templates. It is
              a design proposal, not implementation evidence. Validate requirements, data handling, and
              security with domain experts before building.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}

interface ReportSectionProps {
  section: Section;
  index: number;
  project: Project;
}

function ReportSection({ section, index, project }: ReportSectionProps) {
  const Icon = SECTION_ICONS[section.key] ?? FileText;
  const number = String(index + 1).padStart(2, "0");
  const isTech = section.key === "technology_stack";
  const isApi = section.key === "api_design";
  const isData = section.key === "database_entities";
  const isRisks = section.key === "risks";
  const mvpNote = isRisks ? section.content[section.content.length - 1] : null;
  const prose = isRisks ? [] : section.content;

  return (
    <section className="panel report-section" id={`section-${section.key}`}>
      <div className="report-section-head">
        <span className="section-number">{number}</span>
        <div>
          <h2>{section.title}</h2>
          <p className="section-kicker">
            <Icon size={13} aria-hidden="true" />
            Template-generated section
          </p>
        </div>
      </div>

      {prose.length > 0 && (
        <div className="section-prose">
          {prose.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}

      {isTech && <TechStack project={project} />}
      {isApi && <ApiTable project={project} />}
      {isData && <EntityList project={project} />}
      {isRisks && (
        <>
          <div className="risk-grid">
            {project.risks.map((risk) => (
              <article className="risk-card" key={risk.title}>
                <div className="risk-head">
                  <AlertTriangle size={15} aria-hidden="true" />
                  <h3>{risk.title}</h3>
                </div>
                <p>
                  <strong>Impact.</strong> {risk.impact}
                </p>
                <p>
                  <strong>Mitigation.</strong> {risk.mitigation}
                </p>
              </article>
            ))}
          </div>
          {mvpNote && <p className="section-note">{mvpNote}</p>}
        </>
      )}
    </section>
  );
}

function TechStack({ project }: { project: Project }) {
  return (
    <div className="table-scroll">
      <table className="data-table stack-table">
        <thead>
          <tr>
            <th>Technology</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {project.techStack.map((item) => (
            <tr key={`${item.name}-${item.status}`}>
              <td className="cell-strong">{item.name}</td>
              <td>{item.category}</td>
              <td>{item.purpose}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApiTable({ project }: { project: Project }) {
  return (
    <div className="table-scroll">
      <table className="data-table api-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Purpose</th>
            <th>Auth</th>
          </tr>
        </thead>
        <tbody>
          {project.apiEndpoints.map((endpoint) => (
            <tr key={`${endpoint.method}-${endpoint.path}`}>
              <td>
                <span className={`method method-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
              </td>
              <td>
                <code>{endpoint.path}</code>
              </td>
              <td>{endpoint.purpose}</td>
              <td>{endpoint.auth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntityList({ project }: { project: Project }) {
  return (
    <div className="entity-grid">
      {project.databaseEntities.map((entity) => (
        <article className="entity-card" key={entity.name}>
          <div className="entity-head">
            <span className="entity-icon">
              <Database size={15} aria-hidden="true" />
            </span>
            <div>
              <h3>{entity.name}</h3>
              <p>{entity.purpose}</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {entity.fields.map((field) => (
                  <tr key={field.name}>
                    <td>
                      <code>{field.name}</code>
                    </td>
                    <td>{field.type}</td>
                    <td>{field.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="relationship-row">
            {entity.relationships.map((relationship) => (
              <span className="tag" key={relationship}>
                {relationship}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
