import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function PieChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});
  if (labels.length === 0) return <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">No expense data yet</div>;

  return (
    <div className="h-64">
      <Pie
        data={{ labels, datasets: [{ data: values, backgroundColor: COLORS.slice(0, labels.length), borderWidth: 2, borderColor: "transparent" }] }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 }, color: "#9ca3af" } },
            tooltip: { callbacks: { label: (ctx) => { const total = values.reduce((a, b) => a + b, 0); return `${ctx.label}: $${ctx.raw.toFixed(2)} (${((ctx.raw / total) * 100).toFixed(1)}%)`; } } },
          },
        }}
      />
    </div>
  );
}
