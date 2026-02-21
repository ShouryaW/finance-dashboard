import { useState, useEffect, useCallback } from "react";
import { getTransactions, deleteTransaction, exportTransactions } from "../utils/api";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 skeleton"></div></td>
      <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 skeleton"></div></td>
      <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 skeleton"></div></td>
      <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 skeleton"></div></td>
      <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 skeleton"></div></td>
      <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 skeleton"></div></td>
    </tr>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getTransactions({ search, sort_by: sortBy, sort_dir: sortDir, type: filterType, page })
      .then((res) => {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.pages);
      })
      .catch(() => setError("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, [search, sortBy, sortDir, filterType, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await deleteTransaction(id);
        load();
      } catch {
        setError("Delete failed");
      }
      setDeletingId(null);
    }, 300);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const res = await exportTransactions();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-block">
      {sortBy === field ? (
        sortDir === "asc" ? (
          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
        ) : (
          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
        )
      ) : (
        <svg className="w-3 h-3 inline text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      )}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeInDown">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Transactions
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col sm:flex-row gap-4 border border-gray-100 dark:border-gray-700/50 animate-fadeInUp">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all outline-none"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm animate-shake">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700/50 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort("date")}>
                  Date <SortIcon field="date" />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort("category")}>
                  Category <SortIcon field="category" />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort("amount")}>
                  Amount <SortIcon field="amount" />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <span className="text-4xl block mb-3">📭</span>
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300 animate-fadeInUp ${
                      deletingId === t.id ? "opacity-0 scale-95" : ""
                    }`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{t.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        t.type === "income"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                      }`}>
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{t.description}</td>
                    <td className={`py-3 px-4 text-sm font-semibold text-right ${
                      t.type === "income" ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === i + 1
                    ? "bg-indigo-500 text-white shadow-md"
                    : "border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
