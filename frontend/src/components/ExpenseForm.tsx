import { useCallback, useEffect, useState } from "react";

export default function ExpenseForm({ onSubmit, initialData, onCancel }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Calculate today in "YYYY-MM-DD"
  const today = new Date().toISOString().slice(0, 10);

  // Reset form fields utility
  const resetForm = useCallback(() => {
    setAmount("");
    setCategory("");
    setDate("");
    setDescription("");
    setFormError("");
  }, []);

  // Reset when changing from edit to add, and fill if editing
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || "");
      setCategory(initialData.category || "");
      setDate(initialData.date ? initialData.date.substr(0, 10) : "");
      setDescription(initialData.description || "");
    } else {
      resetForm();
    }
  }, [initialData, resetForm]);

  const handleAmountChange = useCallback((e) => setAmount(e.target.value), []);
  const handleCategoryChange = useCallback(
    (e) => setCategory(e.target.value),
    []
  );
  const handleDateChange = useCallback((e) => setDate(e.target.value), []);
  const handleDescriptionChange = useCallback(
    (e) => setDescription(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setFormError("");
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        setFormError("Amount must be a number greater than 0.");
        return;
      }
      if (!category) {
        setFormError("Category is required.");
        return;
      }
      if (!date) {
        setFormError("Date is required.");
        return;
      }
      onSubmit({
        amount,
        category,
        date,
        description,
      });
      // Only reset form if adding
      if (!initialData) resetForm();
    },
    [amount, category, date, description, onSubmit, initialData, resetForm]
  );

  return (
    <form
      className="bg-white rounded shadow mb-6 p-2 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-end"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col w-full sm:w-32">
        <label className="block text-gray-700 font-medium">Amount</label>
        <input
          type="number"
          className="border px-2 py-1 rounded w-full"
          value={amount}
          onChange={handleAmountChange}
          min="0"
          inputMode="decimal"
        />
      </div>
      <div className="flex flex-col w-full sm:w-44">
        <label className="block text-gray-700 font-medium">Category</label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={category}
          onChange={handleCategoryChange}
          placeholder="e.g., Food, Travel"
        />
      </div>
      <div className="flex flex-col w-full sm:w-40">
        <label className="block text-gray-700 font-medium">Date</label>
        <input
          type="date"
          className="border px-2 py-1 rounded w-full"
          value={date}
          onChange={handleDateChange}
          max={today}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <label className="block text-gray-700 font-medium">Description</label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Optional"
        />
      </div>
      <div className="flex gap-2 pt-2 sm:pt-0 w-full sm:w-auto">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 w-full sm:w-auto"
        >
          {initialData ? "Update" : "Add"}
        </button>
        {initialData && onCancel && (
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
      {formError && (
        <div className="w-full text-red-600 mt-1 text-sm">{formError}</div>
      )}
    </form>
  );
}
