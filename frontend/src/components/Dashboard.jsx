import { useState, useEffect } from "react";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import { getDashboard } from "../utils/api";

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 skeleton"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 skeleton"></div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6 skeleton"></div>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart /><SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl animate-fadeIn">{error}</div>
      </div>
    );
  }

  const cards = [
    {
      title: "Balance",
      value: data.balance || 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      textColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      emoji: "💳",
    },
    {
      title: "Income",
      value: data.income || 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      ),
      textColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      emoji: "📈",
    },
    {
      title: "Expenses",
      value: data.expenses || 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      ),
      textColor: "text-rose-500",
      bgColor: "bg-rose-500/10",
      emoji: "📉",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover-lift p-6 border border-gray-100 dark:border-gray-700/50 animate-fadeInUp"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`${card.bgColor} ${card.textColor} p-2.5 rounded-xl`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold ${card.textColor}`}>
              ${Math.abs(card.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-lg">{card.emoji}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">All time</span>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Banner */}
      {data.forecast && (
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white animate-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔮</span>
            <h3 className="text-lg font-semibold">Monthly Forecast</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Avg Spending</p>
              <p className="text-xl font-bold">${(data.forecast.avg_monthly_expenses || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Avg Income</p>
              <p className="text-xl font-bold">${(data.forecast.avg_monthly_income || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Projected Savings</p>
              <p className="text-xl font-bold">${(data.forecast.projected_savings || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50 hover-lift animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-xl">🍩</span>
            Spending by Category
          </h3>
          {data.category_spending && Object.keys(data.category_spending).length > 0 ? (
            <PieChart data={data.category_spending} />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8">No spending data yet</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50 hover-lift animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Monthly Overview
          </h3>
          {data.monthly_data && data.monthly_data.length > 0 ? (
            <BarChart data={data.monthly_data} />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8">No monthly data yet</p>
          )}
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50 animate-fadeInUp" style={{ animationDelay: "0.55s" }}>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          Income vs Expenses Trend
        </h3>
        {data.monthly_data && data.monthly_data.length > 0 ? (
          <LineChart data={data.monthly_data} />
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">No trend data yet</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-xl">🕐</span>
          Recent Transactions
        </h3>
        {data.recent_transactions && data.recent_transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_transactions.map((t, i) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors animate-fadeInUp"
                    style={{ animationDelay: `${0.7 + i * 0.05}s` }}
                  >
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{t.date}</td>
                    <td className="py-3">
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{t.description}</td>
                    <td className={`py-3 text-sm font-semibold text-right ${
                      t.type === "income" ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
