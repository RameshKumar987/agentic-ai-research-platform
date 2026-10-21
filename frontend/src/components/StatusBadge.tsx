import type { CapabilityStatus } from "../lib/types";

const TONES: Record<string, string> = {
  Implemented: "success",
  MVP: "success",
  "Demo/Simulated": "warning",
  Planned: "neutral",
  Proposed: "neutral",
  Online: "success",
  Offline: "danger",
};

interface StatusBadgeProps {
  status: CapabilityStatus | "MVP" | "Proposed" | "Online" | "Offline";
  dot?: boolean;
}

export function StatusBadge({ status, dot = true }: StatusBadgeProps) {
  const tone = TONES[status] ?? "neutral";
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {status}
    </span>
  );
}
