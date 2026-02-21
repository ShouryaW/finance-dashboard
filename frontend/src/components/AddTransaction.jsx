import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addTransaction } from "../utils/api";

const EXPENSE_CATEGORIES = [
  { name: "Groceries", icon: "🛒" },
  { name: "Rent", icon: "🏠" },
  { name: "Utilities", icon: "⚡" },
  { name: "Transport", icon: "🚗" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Healthcare", icon: "🏥" },
  { name: "Dining", icon: "🍽️" },
  { name: "Shopping", icon: "🛍️" },
];

const INCOME_CATEGORIES = [
  { name: "Salary", icon: "💼" },
  { name: "Freelance", icon: "💻" },
  { name: "Investments", icon: "📈" },
  { name: "Rental", icon: "🏢" },
  { name: "Bonus", icon: "🎉" },
  { name: "Refund", icon: "🔄" },
  { name: "Other", icon: "💰" },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expense");
  const [expenseForm, setExpenseForm] = useState({
    amount: "", category: "", description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [incomeForm, setIncomeForm] = useState({
    amount: "", category: "", description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = activeTab === "expense" ? expenseForm : incomeForm;
  const setForm = activeTab === "expense" ? setExpenseForm : setIncomeForm;
  const categories = activeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isExpense = activeTab === "expense";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError("Please select a category"); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Please enter a valid amount"); return; }
    setLoading(true);
    setError("");
    try {
      await addTransaction({ ...form, amount: parseFloat(form.amount), type: activeTab });
      setSuccess(true);
      setTimeout(() => navigate("/transactions"), 1500);
    } catch {
      setError("Failed to add transaction");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center animate-scaleIn">
        <div className={`w-24 h-24 mx-auto rounded-full ${isExpense ? "bg-rose-100 dark:bg-rose-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"} flex items-center justify-center mb-6`}>
          <svg className={`w-14 h-14 ${isExpense ? "text-rose-500" : "text-emerald-500"} animate-checkmark`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {isExpense ? "Expense" : "Income"} Added! ✅
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Redirecting to transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 animate-fadeInDown">
        <button
          onClick={() => { setActiveTab("expense"); setError(""); }}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "expense"
              ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-md"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <span className="text-lg">📉</span> Add Expense
        </button>
        <button
          onClick={() => { setActiveTab("income"); setError(""); }}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "income"
              ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-md"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <span className="text-lg">📈</span> Add Income
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50 animate-fadeInUp">
        {/* Colored Header */}
        <div className={`bg-gradient-to-r ${isExpense ? "from-rose-500 to-pink-600" : "from-emerald-500 to-teal-600"} p-6 text-white`}>
          <h2 className="text-xl font-bold mb-1">{isExpense ? "New Expense" : "New Income"}</h2>
          <p className="text-white/80 text-sm">{isExpense ? "Track where your money goes" : "Record your earnings"}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="text-center animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</label>
            <div className="flex items-center justify-center mt-2">
              <span className={`text-4xl font-bold ${isExpense ? "text-rose-500" : "text-emerald-500"} mr-1`}>$</span>
              <input
                type="number" step="0.01" min="0" placeholder="0.00"
                className="text-4xl font-bold text-center w-48 outline-none border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-indigo-400 transition-colors py-1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Category Grid */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-3">Category</label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name} type="button"
                  onClick={() => setForm({ ...form, category: cat.name })}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                    form.category === cat.name
                      ? `${isExpense ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-500" : "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500"} shadow-md`
                      : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Description</label>
            <input
              type="text"
              placeholder={isExpense ? "What did you spend on?" : "Where did this come from?"}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all outline-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Date */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all outline-none"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl animate-shake">{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            className={`w-full bg-gradient-to-r ${isExpense ? "from-rose-500 to-pink-600" : "from-emerald-500 to-teal-600"} text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <>{isExpense ? "Add Expense" : "Add Income"}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
