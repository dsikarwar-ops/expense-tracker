import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function AdminExpenses() {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  // Filter states
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchAllExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(Array.isArray(res.data.data) ? res.data.data : []);
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch expenses.");
      setLoading(false);
    }
  }, [token]);

  const handleStatusChange = useCallback(
    async (id, status) => {
      try {
        const res = await api.put(
          `/expenses/${id}`,
          { status },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === id ? { ...exp, status: res.data.data[0].status } : exp
          )
        );
        setActionMessage(`Expense status changed to "${status}"`);
        setTimeout(() => setActionMessage(""), 2000);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to update status.");
      }
    },
    [token]
  );

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/expenses");
      return;
    }
    fetchAllExpenses();
  }, [user, navigate, fetchAllExpenses]);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = filterCategory
      ? exp.category.toLowerCase().includes(filterCategory.toLowerCase())
      : true;
    const matchesUser = filterUser
      ? exp.user?.name?.toLowerCase().includes(filterUser.toLowerCase())
      : true;
    const matchesDate = filterDate
      ? new Date(exp.date).toISOString().split("T")[0] === filterDate
      : true;

    return matchesCategory && matchesUser && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading all expenses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto sm:p-4 px-2 pt-4 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4 text-center">
          All Employees’ Expenses
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-4 text-center text-sm sm:text-base">
            {error}
          </div>
        )}
        {actionMessage && (
          <div className="h-12 bg-green-100 text-green-700 p-2 rounded mb-4 text-center font-medium text-sm sm:text-base flex items-center justify-center">
            {actionMessage || ""}
          </div>
        )}
        {/* 🔍 Filters with Reset Button */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Filter by User
            </label>
            <input
              type="text"
              placeholder="Enter user name"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Filter by Category
            </label>
            <input
              type="text"
              placeholder="Enter category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <button
            onClick={() => {
              setFilterCategory("");
              setFilterUser("");
              setFilterDate("");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded whitespace-nowrap mt-2 sm:mt-0"
          >
            Reset Filters
          </button>
        </div>

        {/* 📋 Expenses Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[600px] sm:min-w-full border-collapse bg-white rounded shadow text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-blue-100 text-blue-700">
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  User
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Email
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Description
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Category
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Date
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-right">
                  Amount
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
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-400">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 sm:px-4 break-words max-w-[100px]">
                      {expense.user?.name || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4 break-all max-w-[120px]">
                      {expense.user?.email || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4">
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
                        className={
                          expense.status?.toLowerCase() === "approved"
                            ? "text-green-600 font-medium"
                            : expense.status?.toLowerCase() === "rejected"
                            ? "text-red-600 font-medium"
                            : "text-gray-700 font-medium"
                        }
                      >
                        {expense.status?.charAt(0).toUpperCase() +
                          expense.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                        {expense.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleStatusChange(expense._id, "approved")
                            }
                            className="text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-xs sm:text-sm"
                          >
                            Approve
                          </button>
                        )}
                        {expense.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handleStatusChange(expense._id, "rejected")
                            }
                            className="text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
