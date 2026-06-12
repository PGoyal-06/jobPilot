type Props = {
  percentage: number;
  missingFields: string[];
};

export function CompletionBanner({ percentage, missingFields }: Props) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percentage / 100);
  const isComplete = percentage === 100;
  const ringColor = isComplete
    ? "var(--color-success)"
    : "var(--color-warning)";

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            {isComplete ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="var(--color-success)"
                  strokeWidth="2"
                />
                <path
                  d="M8 12l3 3 5-5"
                  stroke="var(--color-success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="var(--color-warning)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="9"
                  x2="12"
                  y2="13"
                  stroke="var(--color-warning)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="var(--color-warning)" />
              </svg>
            )}
            <h2 className="text-base font-semibold leading-6 text-text-primary">
              {isComplete ? "Profile complete" : "Profile needs attention"}
            </h2>
          </div>
          <p className="mt-1 text-sm font-normal leading-5 text-text-secondary">
            {isComplete
              ? "Your profile is ready. All required information is filled in."
              : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
          </p>
          {!isComplete && (
            <div className="mt-3 flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full bg-warning-light px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-warning"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative h-24 w-24 shrink-0">
          <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-text-primary">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
