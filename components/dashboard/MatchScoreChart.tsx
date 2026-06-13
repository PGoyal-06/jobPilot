"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type RangeValue = { range: string; value: number };

interface Props {
  data: RangeValue[];
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-card">
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <p className="text-sm text-text-muted">count : {payload[0].value}</p>
    </div>
  );
}

export function MatchScoreChart({ data }: Props) {
  const isEmpty = data.every((d) => d.value === 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Match Score Distribution
      </h2>
      {isEmpty ? (
        <div className="mt-4 flex h-60 items-center justify-center">
          <p className="text-sm text-text-muted">No data yet</p>
        </div>
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#E7EAF3"
                vertical={false}
              />
              <XAxis
                dataKey="range"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F3F4F6", opacity: 0.5 }} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
