import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  loading?: boolean;
  tone?: "violet" | "blue" | "cyan" | "emerald";
}

export function StatCard({ label, value, hint, icon: Icon, loading, tone = "violet" }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}>
        <Icon size={19} aria-hidden="true" />
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        {loading ? <span className="skeleton skeleton-value" /> : <strong className="stat-value">{value}</strong>}
        <span className="stat-hint">
          {hint}
          <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
