interface StatCardProps {
  label: string;
  value: string;
  trendBadge?: string;
  trendText?: string;
  subtitle?: string;
}

export function StatCard({
  label,
  value,
  trendBadge,
  trendText,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <p className="text-sm font-normal leading-5 text-text-secondary">{label}</p>
      <p className="mt-2 text-[30px] font-semibold leading-9 text-text-primary">{value}</p>
      {trendBadge && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker">
            {trendBadge}
          </span>
          {trendText && (
            <span className="text-xs text-text-muted">{trendText}</span>
          )}
        </div>
      )}
      {subtitle && (
        <p className="mt-2 text-xs text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
