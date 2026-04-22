"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SpendingChartProps {
  data: {
    category: { name: string; color: string };
    amount: number;
  }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.map((d) => ({
    name: d.category.name,
    value: d.amount,
    color: d.category.color,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {chartData.slice(0, 4).map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-muted truncate">{d.name}</span>
            </div>
            <span className="font-medium shrink-0 tabular-nums">
              ${d.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        {chartData.length > 4 && (
          <p className="text-xs text-muted">+{chartData.length - 4} more</p>
        )}
      </div>
    </div>
  );
}
