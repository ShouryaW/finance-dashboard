import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LineChart({ data }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">No trend data available</div>;

  const labels = data.map((d) => {
    const [y, m] = d.month.split("-");
    return new Date(y, m - 1).toLocaleString("default", { month: "short", year: "2-digit" });
  });

  const netSavings = data.map((d) => d.income - d.expenses);

  return (
    <div className="h-64">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Income",
              data: data.map((d) => d.income),
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#10b981",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Expenses",
              data: data.map((d) => d.expenses),
              borderColor: "#f43f5e",
              backgroundColor: "rgba(244, 63, 94, 0.1)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#f43f5e",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Net Savings",
              data: netSavings,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.05)",
              fill: true,
              tension: 0.4,
              borderDash: [5, 5],
              pointBackgroundColor: "#6366f1",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top", labels: { usePointStyle: true, pointStyleWidth: 10, color: "#9ca3af" } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`,
              },
            },
          },
          scales: {
            y: {
              ticks: { callback: (val) => `$${val.toLocaleString()}`, color: "#9ca3af" },
              grid: { color: "rgba(156,163,175,0.1)" },
            },
            x: { grid: { display: false }, ticks: { color: "#9ca3af" } },
          },
        }}
      />
    </div>
  );
}
