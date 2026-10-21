import type { LucideIcon } from "lucide-react";
import type { Capability } from "../lib/capabilities";
import { StatusBadge } from "./StatusBadge";

interface CapabilityCardProps {
  capability: Capability;
  icon: LucideIcon;
}

export function CapabilityCard({ capability, icon: Icon }: CapabilityCardProps) {
  return (
    <article className={`capability-card capability-${capability.status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
      <div className="capability-top">
        <span className="capability-icon">
          <Icon size={18} aria-hidden="true" />
        </span>
        <StatusBadge status={capability.status} />
      </div>
      <h3>{capability.title}</h3>
      <p>{capability.summary}</p>
      <p className="capability-evidence">{capability.evidence}</p>
    </article>
  );
}
