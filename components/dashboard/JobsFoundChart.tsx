"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type DayValue = { day: string; value: number };

interface Props {
  data: DayValue[];
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

export function JobsFoundChart({ data }: Props) {
  const isEmpty = data.every((d) => d.value === 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Jobs Found Over Time
      </h2>
      {isEmpty ? (
        <div className="mt-4 flex h-60 items-center justify-center">
          <p className="text-sm text-text-muted">No data yet</p>
        </div>
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#E7EAF3"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#7C5CFC"
                strokeWidth={2.5}
                fill="url(#jobsGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
