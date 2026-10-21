import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Workflow,
} from "lucide-react";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { ListSkeleton } from "../components/Loading";
import { PageHeader } from "../components/PageHeader";
import { useResource } from "../hooks/useApi";
import { listProjects } from "../lib/api";
import { formatDate, generatorLabel } from "../lib/format";
import type { Domain } from "../lib/types";

const DOMAIN_FILTERS: (Domain | "All")[] = ["All", "Healthcare", "Education", "Finance", "E-commerce", "Other"];

export function Documents() {
  const projects = useResource(listProjects, []);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<Domain | "All">("All");

  const items = projects.data?.items ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = items.filter((project) => {
    const matchesDomain = domain === "All" || project.domain === domain;
    const matchesQuery =
      !normalizedQuery ||
      project.title.toLowerCase().includes(normalizedQuery) ||
      project.domain.toLowerCase().includes(normalizedQuery) ||
      project.complexity.toLowerCase().includes(normalizedQuery);
    return matchesDomain && matchesQuery;
  });

  return (
    <div className="page documents-page">
      <PageHeader
        eyebrow="Document library"
        title="Generated documents"
        description="Every blueprint created during this backend session. Open a report to review, copy, download, or inspect its proposed architecture."
        actions={
          <Link to="/new" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" />
            New research
          </Link>
        }
      />

      <div className="library-toolbar">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="Search by title, domain, or complexity"
            aria-label="Search generated documents"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="select-wrap">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <select
            value={domain}
            aria-label="Filter by domain"
            onChange={(event) => setDomain(event.target.value as Domain | "All")}
          >
            {DOMAIN_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All domains" : option}
              </option>
            ))}
          </select>
        </div>
        {!projects.loading && !projects.error && (
          <span className="library-count">
            {filtered.length} of {items.length} {items.length === 1 ? "document" : "documents"}
          </span>
        )}
      </div>

      {projects.loading ? (
        <div className="panel">
          <ListSkeleton rows={5} />
        </div>
      ) : projects.error ? (
        <ErrorState
          title="The document library is unavailable"
          message={projects.error.message}
          onRetry={projects.reload}
        />
      ) : items.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Sparkles size={24} aria-hidden="true" />}
            title="Your document library is empty"
            description="Generate your first blueprint and it will appear here for the rest of this backend session."
            actionLabel="Create your first blueprint"
            actionTo="/new"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No documents match those filters"
            description="Try a different search term or switch the domain filter back to All domains."
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setQuery("");
                setDomain("All");
              }}
            >
              Clear filters
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="document-grid">
          {filtered.map((project) => (
            <Link to={`/projects/${project.id}`} className="document-card" key={project.id}>
              <div className="document-card-top">
                <span className="document-icon">
                  <FileText size={18} aria-hidden="true" />
                </span>
                <span className={`tag domain-tag domain-${project.domain.toLowerCase().replace(/[^a-z]/g, "")}`}>
                  {project.domain}
                </span>
              </div>
              <h2>{project.title}</h2>
              <p className="document-meta">
                {project.complexity} &middot; {project.sectionCount} sections &middot;{" "}
                {generatorLabel(project.generator)}
              </p>
              <div className="document-footer">
                <span className="document-date">{formatDate(project.createdAt)}</span>
                <span className="document-cta">
                  Open report
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
              <span className="document-arch">
                <Workflow size={12} aria-hidden="true" />
                Architecture included
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
