import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export function NotFound() {
  return (
    <div className="page">
      <div className="panel not-found-panel">
        <EmptyState
          icon={<Compass size={24} aria-hidden="true" />}
          title="This page does not exist"
          description="The workspace route may have changed or the link is incomplete. Head back to the overview to continue."
          actionLabel="Back to overview"
          actionTo="/"
        />
        <p className="not-found-hint">
          Need your documents?{" "}
          <Link to="/projects" className="text-link">
            Open the library
          </Link>
        </p>
      </div>
    </div>
  );
}
