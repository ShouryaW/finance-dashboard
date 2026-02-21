import { useState, useEffect } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../utils/api";

const GOAL_ICONS = [
  { name: "Vacation", icon: "🏖️" },
  { name: "Emergency Fund", icon: "🛡️" },
  { name: "New Car", icon: "🚗" },
  { name: "House Down Payment", icon: "🏠" },
  { name: "Education", icon: "🎓" },
  { name: "Retirement", icon: "👴" },
  { name: "Wedding", icon: "💒" },
  { name: "Tech Gadget", icon: "📱" },
  { name: "Investment", icon: "📈" },
  { name: "Custom", icon: "⭐" },
];

function GoalRing({ percentage, size = 80, strokeWidth = 8, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100 dark:text-gray-700" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{ animation: "progress-fill 1s ease-out" }}
      />
    </svg>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "", target_amount: "", current_amount: "0", deadline: "", icon: "⭐",
  });

  const load = () => {
    setLoading(true);
    getGoals()
      .then((res) => setGoals(res.data.goals))
      .catch(() => setError("Failed to load goals"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount || 0),
        deadline: form.deadline || null,
        icon: form.icon,
      };
      if (editingId) {
        await updateGoal(editingId, payload);
      } else {
        await createGoal(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", target_amount: "", current_amount: "0", deadline: "", icon: "⭐" });
      load();
    } catch {
      setError(editingId ? "Update failed" : "Failed to create goal");
    }
  };

  const handleEdit = (g) => {
    setForm({
      name: g.name, target_amount: g.target_amount.toString(),
      current_amount: g.current_amount.toString(), deadline: g.deadline || "", icon: g.icon || "⭐",
    });
    setEditingId(g.id);
    setShowForm(true);
  };

  const handleAddFunds = async (g, amount) => {
    try {
      await updateGoal(g.id, { ...g, current_amount: g.current_amount + amount });
      load();
    } catch { setError("Failed to update"); }
  };

  const getColor = (pct) => {
    if (pct >= 100) return "#10b981";
    if (pct >= 60) return "#6366f1";
    if (pct >= 30) return "#f59e0b";
    return "#f43f5e";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center animate-fadeInDown">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Savings Goals
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", target_amount: "", current_amount: "0", deadline: "", icon: "⭐" }); }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {showForm ? "Cancel" : "New Goal"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50 animate-scaleIn">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{editingId ? "Edit Goal" : "Create New Goal"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Icon selector */}
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map((gi) => (
                  <button
                    key={gi.name} type="button"
                    onClick={() => setForm({ ...form, icon: gi.icon })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${
                      form.icon === gi.icon
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500 shadow-md"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                    title={gi.name}
                  >
                    {gi.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Goal Name</label>
                <input type="text" placeholder="e.g. Vacation Fund" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-300 outline-none transition-all" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Target Amount ($)</label>
                <input type="number" step="0.01" min="1" placeholder="5000.00" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-300 outline-none transition-all" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Current Saved ($)</label>
                <input type="number" step="0.01" min="0" placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-300 outline-none transition-all" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Deadline (Optional)</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-300 outline-none transition-all" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              {editingId ? "Update Goal" : "Create Goal"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm animate-shake">{error}</div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full skeleton"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 skeleton"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 skeleton"></div>
                </div>
              </div>
            </div>
          ))
        ) : goals.length === 0 ? (
          <div className="col-span-2 text-center py-16 animate-fadeIn">
            <span className="text-5xl block mb-4">🎯</span>
            <p className="text-gray-400 dark:text-gray-500 text-lg">No savings goals yet</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Set a goal and start saving!</p>
          </div>
        ) : (
          goals.map((g, i) => {
            const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
            const remaining = Math.max(0, g.target_amount - g.current_amount);
            const color = getColor(pct);
            const daysLeft = g.deadline ? Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;

            return (
              <div
                key={g.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50 hover-lift animate-fadeInUp ${
                  pct >= 100 ? "ring-2 ring-emerald-300 dark:ring-emerald-800" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Progress Ring */}
                  <div className="relative flex-shrink-0">
                    <GoalRing percentage={pct} color={color} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">{g.icon || "⭐"}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate">{g.name}</h3>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <button onClick={() => handleEdit(g)} className="text-gray-400 hover:text-indigo-500 transition-colors p-1" title="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteGoal(g.id).then(load)} className="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Delete">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-semibold" style={{ color }}>${g.current_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      <span className="text-gray-400 dark:text-gray-500"> / ${g.target_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
                      {pct < 100 && <span>${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} to go</span>}
                      {pct >= 100 && <span className="text-emerald-500 font-semibold">🎉 Goal reached!</span>}
                      {daysLeft !== null && pct < 100 && (
                        <span className={daysLeft < 30 ? "text-amber-500" : ""}>{daysLeft}d left</span>
                      )}
                    </div>

                    {/* Quick add buttons */}
                    {pct < 100 && (
                      <div className="flex gap-2 mt-3">
                        {[50, 100, 500].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handleAddFunds(g, amt)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
                          >
                            +${amt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
