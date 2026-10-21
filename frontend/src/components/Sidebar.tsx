import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  FileText,
  LayoutDashboard,
  Network,
  Plus,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/new", label: "New Research", icon: Plus, end: false },
  { to: "/projects", label: "Generated Documents", icon: FileText, end: false },
  { to: "/architecture", label: "Architecture", icon: Workflow, end: false },
  { to: "/status", label: "System Status", icon: Activity, end: false },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Primary navigation">
      <div className="sidebar-head">
        <Link to="/" className="brand" onClick={onClose}>
          <span className="brand-mark">
            <Network size={20} aria-hidden="true" />
          </span>
          <span className="brand-copy">
            <strong>ResearchHub</strong>
            <small>Blueprint studio</small>
          </span>
        </Link>
        <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="sidebar-section-label">Workspace</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <div className="sidebar-note-icon">
            <Sparkles size={15} aria-hidden="true" />
          </div>
          <div>
            <strong>Honest by default</strong>
            <p>Template blueprints. No hidden web research or agent execution.</p>
          </div>
        </div>
        <div className="sidebar-meta">
          <span className="sidebar-meta-dot" aria-hidden="true" />
          MVP v0.1 &middot; In-memory session
        </div>
      </div>
    </aside>
  );
}
