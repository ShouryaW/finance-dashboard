import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">No monthly data available</div>;

  const labels = data.map((d) => { const [y, m] = d.month.split("-"); return new Date(y, m - 1).toLocaleString("default", { month: "short", year: "2-digit" }); });

  return (
    <div className="h-64">
      <Bar
        data={{
          labels,
          datasets: [
            { label: "Income", data: data.map((d) => d.income), backgroundColor: "rgba(16, 185, 129, 0.7)", borderColor: "#10b981", borderWidth: 1, borderRadius: 6 },
            { label: "Expenses", data: data.map((d) => d.expenses), backgroundColor: "rgba(244, 63, 94, 0.7)", borderColor: "#f43f5e", borderWidth: 1, borderRadius: 6 },
          ],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "top", labels: { usePointStyle: true, pointStyleWidth: 10, color: "#9ca3af" } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}` } } },
          scales: { y: { beginAtZero: true, ticks: { callback: (val) => `$${val.toLocaleString()}`, color: "#9ca3af" }, grid: { color: "rgba(156,163,175,0.1)" } }, x: { grid: { display: false }, ticks: { color: "#9ca3af" } } },
        }}
      />
    </div>
  );
}
