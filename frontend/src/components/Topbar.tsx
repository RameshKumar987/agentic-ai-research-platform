import { Link, useLocation } from "react-router-dom";
import { Menu, Plus, TriangleAlert } from "lucide-react";
import { useHealth } from "../hooks/useApi";

interface TopbarProps {
  onOpenMenu: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  new: "New Research",
  projects: "Generated Documents",
  architecture: "Architecture",
  status: "System Status",
};

export function Topbar({ onOpenMenu }: TopbarProps) {
  const location = useLocation();
  const health = useHealth(45_000);
  const segments = location.pathname.split("/").filter(Boolean);
  const section = segments[0] ?? "";
  const isReport = section === "projects" && segments.length > 1;
  const label = isReport ? "Blueprint report" : (SECTION_LABELS[section] ?? "Overview");

  const statusLabel = health.error ? "API offline" : health.loading ? "Checking API" : "API online";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button menu-button" onClick={onOpenMenu} aria-label="Open navigation">
          <Menu size={19} aria-hidden="true" />
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Workspace</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label}</span>
        </nav>
      </div>

      <div className="topbar-actions">
        <Link
          to="/status"
          className={`api-pill ${health.error ? "api-pill-offline" : health.loading ? "api-pill-loading" : "api-pill-online"}`}
          title={health.error ? health.error.message : "Backend health is available"}
        >
          {health.error ? (
            <TriangleAlert size={13} aria-hidden="true" />
          ) : (
            <span className="api-dot" aria-hidden="true" />
          )}
          {statusLabel}
        </Link>
        <Link to="/new" className="btn btn-primary btn-sm topbar-cta">
          <Plus size={15} aria-hidden="true" />
          New research
        </Link>
      </div>
    </header>
  );
}
