import { useCallback, useMemo, useState } from "react";

export default function ExpenseTable({
  expenses,
  onDelete,
  onEdit,
  categoryFilter,
  setCategoryFilter,
  searchTerm,
  setSearchTerm,
  sortConfig,
  setSortConfig,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  // Categories dropdown, memoized
  const categories = useMemo(
    () =>
      Array.from(new Set(expenses.map((exp) => exp.category)))
        .filter(Boolean)
        .sort(),
    [expenses]
  );

  // Filter, search & date range, memoized
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (categoryFilter) {
      result = result.filter((exp) => exp.category === categoryFilter);
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.description?.toLowerCase().includes(search) ||
          exp.category?.toLowerCase().includes(search)
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((exp) => new Date(exp.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((exp) => new Date(exp.date) <= end);
    }
    return result;
  }, [expenses, categoryFilter, searchTerm, startDate, endDate]);

  // Sorting logic
  const sortedExpenses = useMemo(() => {
    if (!sortConfig.key) return filteredExpenses;
    return [...filteredExpenses].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === "amount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      if (sortConfig.key === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredExpenses, sortConfig]);

  // Responsive filter handlers
  const handleCategoryFilter = useCallback(
    (e) => setCategoryFilter(e.target.value),
    [setCategoryFilter]
  );
  const handleSearchTerm = useCallback(
    (e) => setSearchTerm(e.target.value),
    [setSearchTerm]
  );
  const handleStartDate = useCallback((e) => setStartDate(e.target.value), []);
  const handleEndDate = useCallback((e) => setEndDate(e.target.value), []);

  const handleSort = useCallback(
    (key) => {
      setSortConfig((prev) => {
        if (prev.key === key) {
          return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        }
        return { key, direction: "asc" };
      });
    },
    [setSortConfig]
  );

  return (
    <div>
      {/* Filters (stack on mobile, inline on tablet/desktop) */}
      <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2 sm:gap-4 mb-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">Category:</span>
          <select
            value={categoryFilter || ""}
            onChange={handleCategoryFilter}
            className="border p-1 rounded w-full sm:w-auto"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">Search:</span>
          <input
            type="text"
            placeholder="Description/Category"
            value={searchTerm || ""}
            onChange={handleSearchTerm}
            className="border p-1 rounded w-full sm:w-auto"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">Start:</span>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDate}
            className="border p-1 rounded w-full sm:w-auto"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">End:</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDate}
            className="border p-1 rounded w-full sm:w-auto"
          />
        </div>
      </div>
      {/* Expense table, scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-[650px] sm:min-w-full border-collapse bg-white rounded shadow text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-blue-100 text-blue-700">
              <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                <button
                  className="w-full text-left"
                  onClick={() => handleSort("description")}
                >
                  Description
                </button>
              </th>
              <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                <button
                  className="w-full text-left"
                  onClick={() => handleSort("category")}
                >
                  Category
                </button>
              </th>
              <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                <button
                  className="w-full text-left"
                  onClick={() => handleSort("date")}
                >
                  Date
                </button>
              </th>
              <th className="py-2 px-2 sm:px-4 font-semibold text-right">
                <button
                  className="w-full text-right"
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </button>
              </th>
              <th className="py-2 px-2 sm:px-4 font-semibold text-center">
                Status
              </th>
              <th className="py-2 px-2 sm:px-4 font-semibold text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-3 text-gray-400">
                  No expenses match the filter.
                </td>
              </tr>
            ) : (
              sortedExpenses.map((expense) => {
                const isPending = expense.status === "Pending";
                return (
                  <tr
                    key={expense._id}
                    className="border-b hover:bg-gray-50"
                    onMouseEnter={() => setHoveredRow(expense._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="py-2 px-2 sm:px-4 break-words max-w-[120px]">
                      {expense.description || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4">{expense.category}</td>
                    <td className="py-2 px-2 sm:px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-right text-red-600 font-bold">
                      ${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold
                          ${
                            expense.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : expense.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }
                        `}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-center">
                        <button
                          className="text-blue-600 hover:underline text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                          onClick={() => isPending && onEdit && onEdit(expense)}
                          disabled={!isPending}
                          title={
                            !isPending && hoveredRow === expense._id
                              ? "You can only edit if status is pending"
                              : ""
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                          onClick={() => {
                            if (
                              isPending &&
                              window.confirm(
                                "Are you sure you want to delete this expense?"
                              )
                            ) {
                              onDelete(expense._id);
                            }
                          }}
                          disabled={!isPending}
                          title={
                            !isPending && hoveredRow === expense._id
                              ? "You can only delete if status is pending"
                              : ""
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
