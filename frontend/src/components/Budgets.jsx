import { useState, useEffect } from "react";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../utils/api";

const CATEGORIES = [
  "Groceries", "Rent", "Utilities", "Transport",
  "Entertainment", "Healthcare", "Dining", "Shopping"
];

function SkeletonBudget() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 skeleton"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 skeleton"></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-2 skeleton"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 skeleton"></div>
    </div>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: CATEGORIES[0], limit_amount: "",
    month: new Date().toISOString().slice(0, 7),
  });

  const load = () => {
    setLoading(true);
    getBudgets()
      .then((res) => setBudgets(res.data.budgets))
      .catch(() => setError("Failed to load budgets"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBudget(editingId, { ...form, limit_amount: parseFloat(form.limit_amount) });
      } else {
        await createBudget({ ...form, limit_amount: parseFloat(form.limit_amount) });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ category: CATEGORIES[0], limit_amount: "", month: new Date().toISOString().slice(0, 7) });
      load();
    } catch {
      setError(editingId ? "Update failed" : "Failed to add budget");
    }
  };

  const handleEdit = (b) => {
    setForm({ category: b.category, limit_amount: b.limit_amount.toString(), month: b.month });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try { await deleteBudget(id); load(); } catch { setError("Delete failed"); }
  };

  const getStatusColor = (pct) => {
    if (pct >= 100) return { bar: "from-rose-500 to-red-600", badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", label: "Over Budget" };
    if (pct >= 80) return { bar: "from-amber-400 to-orange-500", badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", label: "Warning" };
    return { bar: "from-emerald-400 to-green-500", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", label: "On Track" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center animate-fadeInDown">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          Budgets
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ category: CATEGORIES[0], limit_amount: "", month: new Date().toISOString().slice(0, 7) }); }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {showForm ? "Cancel" : "Add Budget"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50 animate-scaleIn">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{editingId ? "Edit Budget" : "New Budget"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Category</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-300 outline-none transition-all" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Limit ($)</label>
              <input type="number" step="0.01" min="0" placeholder="500.00" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-300 outline-none transition-all" value={form.limit_amount} onChange={(e) => setForm({ ...form, limit_amount: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Month</label>
              <input type="month" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-300 outline-none transition-all" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                {editingId ? "Update Budget" : "Create Budget"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm animate-shake">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonBudget key={i} />)
        ) : budgets.length === 0 ? (
          <div className="col-span-2 text-center py-16 animate-fadeIn">
            <span className="text-5xl block mb-4">🧮</span>
            <p className="text-gray-400 dark:text-gray-500 text-lg">No budgets set yet</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Click "Add Budget" to get started</p>
          </div>
        ) : (
          budgets.map((b, i) => {
            const pct = b.percentage || 0;
            const status = getStatusColor(pct);
            return (
              <div
                key={b.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50 hover-lift animate-fadeInUp ${
                  pct >= 100 ? "ring-2 ring-rose-300 dark:ring-rose-800" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{b.category}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{b.month}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.badge}`}>{status.label}</span>
                    <button onClick={() => handleEdit(b)} className="text-gray-400 hover:text-indigo-500 transition-colors p-1" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${status.bar} rounded-full transition-all duration-1000 ease-out animate-progress-fill`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">${(b.spent || 0).toFixed(2)} of ${b.limit_amount.toFixed(2)}</span>
                  <span className={`font-semibold ${pct >= 100 ? "text-rose-500" : pct >= 80 ? "text-amber-500" : "text-emerald-500"}`}>{pct.toFixed(0)}%</span>
                </div>

                {pct >= 100 && (
                  <div className="mt-3 flex items-center gap-2 text-rose-500 text-sm animate-shake">
                    <span>⚠️</span>
                    Over budget by ${((b.spent || 0) - b.limit_amount).toFixed(2)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
