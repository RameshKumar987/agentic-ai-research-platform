import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fatal-state">
          <div className="error-icon">
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <h1>This view hit an unexpected error.</h1>
          <p>Your projects are still safe in the backend session. Reload the workspace to continue.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.assign("/")}>
            Reload workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
