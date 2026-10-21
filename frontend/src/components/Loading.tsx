export function SkeletonPage({ cards = 4 }: { cards?: number }) {
  return (
    <div className="page" aria-busy="true" aria-label="Loading content">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton-grid">
        {Array.from({ length: cards }).map((_, index) => (
          <div className="skeleton skeleton-card" key={index} />
        ))}
      </div>
      <div className="skeleton skeleton-panel" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="list-skeleton" aria-busy="true" aria-label="Loading projects">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="list-skeleton-row" key={index}>
          <span className="skeleton skeleton-avatar" />
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line skeleton-line-short" />
        </div>
      ))}
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="report-skeleton" aria-busy="true" aria-label="Loading report">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-heading skeleton-heading-wide" />
      <div className="skeleton skeleton-copy" />
      <div className="report-skeleton-grid">
        <div className="skeleton skeleton-toc" />
        <div className="report-skeleton-body">
          <div className="skeleton skeleton-panel" />
          <div className="skeleton skeleton-panel" />
          <div className="skeleton skeleton-panel" />
        </div>
      </div>
    </div>
  );
}
