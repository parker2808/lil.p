'use client';

import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function ViewsAreaChart({
  data,
  viewsLabel,
}: {
  data: Array<{ date: string; views: number }>;
  viewsLabel: string;
}): ReactNode {
  return (
    <div className="h-64 w-full" data-slot="chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--card-foreground)',
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name={viewsLabel}
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
