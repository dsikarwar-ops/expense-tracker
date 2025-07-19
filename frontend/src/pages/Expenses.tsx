import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  startEditing,
  stopEditing,
  setCategoryFilter,
  setSearchTerm,
  setSortConfig,
  clearActionMessage,
} from "../../redux/slices/expensesSlice";
import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";

export default function Expenses() {
  const dispatch = useDispatch();

  const {
    items: expenses,
    loading,
    error,
    actionMessage,
    editingExpense,
    categoryFilter,
    searchTerm,
    sortConfig,
  } = useSelector((state) => state.expenses);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        console.log("here");
        dispatch(clearActionMessage());
      }, 3000);
      return () => clearTimeout(timer); // Cleanup on unmount or message change
    }
  }, [actionMessage, dispatch]);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleAddExpense = useCallback(
    (data) => {
      dispatch(addExpense(data));
    },
    [dispatch]
  );

  const handleEditExpense = useCallback(
    (data) => {
      dispatch(updateExpense({ id: editingExpense._id, data }));
    },
    [dispatch, editingExpense]
  );

  const handleDeleteExpense = useCallback(
    (id) => {
      dispatch(deleteExpense(id));
    },
    [dispatch]
  );

  const handleStartEditExpense = useCallback(
    (expense) => {
      dispatch(startEditing(expense));
    },
    [dispatch]
  );

  const handleCancelEdit = useCallback(() => {
    dispatch(stopEditing());
  }, [dispatch]);

  const handleSetCategoryFilter = (val) => dispatch(setCategoryFilter(val));
  const handleSetSearchTerm = (val) => dispatch(setSearchTerm(val));
  const handleSetSortConfig = (val) => dispatch(setSortConfig(val));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto sm:p-4 px-2 pt-4 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
          Hello, {user?.name || user?.username}! Your Expenses
        </h1>

        <div className="w-full">
          <ExpenseForm
            onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
            initialData={editingExpense}
            onCancel={editingExpense ? handleCancelEdit : undefined}
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-4 text-center text-sm sm:text-base">
            {error}
          </div>
        )}
        {actionMessage && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center font-medium text-sm sm:text-base">
            {actionMessage}
          </div>
        )}
        <div className="w-full overflow-x-auto">
          <ExpenseTable
            expenses={expenses}
            onDelete={handleDeleteExpense}
            onEdit={handleStartEditExpense}
            categoryFilter={categoryFilter}
            setCategoryFilter={handleSetCategoryFilter}
            searchTerm={searchTerm}
            setSearchTerm={handleSetSearchTerm}
            sortConfig={sortConfig}
            setSortConfig={handleSetSortConfig}
          />
        </div>
      </div>
    </div>
  );
}
