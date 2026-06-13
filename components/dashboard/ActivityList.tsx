export type ActivityEntry = {
  text: string;
  time: string;
  dot: "run" | "research";
};

type DotConfig = { outerBg: string; innerBg: string };

const DOTS: Record<ActivityEntry["dot"], DotConfig> = {
  run: { outerBg: "#DBEAFE", innerBg: "#61A8FF" },       // info blue — job search run
  research: { outerBg: "#D0FAE5", innerBg: "#00BC7D" },  // success green — company research
};

interface ActivityListProps {
  activities: ActivityEntry[];
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Recent Activity
      </h2>
      {activities.length === 0 ? (
        <div className="mt-5 flex items-center justify-center py-10">
          <p className="text-sm text-text-muted">
            No activity yet. Run a job search to get started.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-5">
          {activities.map((activity, i) => {
            const dot = DOTS[activity.dot];
            return (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ background: dot.outerBg }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: dot.innerBg }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium leading-5 text-text-primary">
                    {activity.text}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{activity.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
