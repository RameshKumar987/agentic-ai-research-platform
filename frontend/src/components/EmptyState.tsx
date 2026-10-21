import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, actionLabel, actionTo, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon ?? <Inbox size={24} aria-hidden="true" />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionTo && (
        <Link className="btn btn-primary btn-sm" to={actionTo}>
          {actionLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
      {children}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  backTo?: { label: string; to: string };
}

export function ErrorState({ title = "Something went wrong", message, onRetry, backTo }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon">
        <AlertTriangle size={22} aria-hidden="true" />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="state-actions">
          {onRetry && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
              Try again
            </button>
          )}
          {backTo && (
            <Link className="btn btn-ghost btn-sm" to={backTo.to}>
              {backTo.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
