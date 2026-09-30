import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { formatTime12Hour } from "../utils/notificationParser";
import toast from "react-hot-toast";

export default function PersonalExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [merchant, setMerchant] = useState("");
  const [transactionId, setTransactionId] = useState(null);

  // Set default / initial values
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount !== undefined ? String(initialData.amount) : "");
        setDescription(initialData.description || "");

        // Format date to YYYY-MM-DD for <input type="date" />
        if (initialData.date) {
          const d = new Date(initialData.date);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            setDate(`${year}-${month}-${day}`);
          } else {
            setDate(initialData.date);
          }
        } else {
          setDate(getTodayDateString());
        }

        setTime(initialData.time || formatTime12Hour());
        setMerchant(initialData.merchant || "");
        setTransactionId(initialData.transactionId || null);
      } else {
        // Defaults for new expense
        setAmount("");
        setDescription("");
        setDate(getTodayDateString());
        setTime(formatTime12Hour());
        setMerchant("");
        setTransactionId(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter an expense description");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!time.trim()) {
      toast.error("Please enter a time (e.g. 02:35 PM)");
      return;
    }

    onSubmit({
      amount: numAmount,
      description: description.trim(),
      date,
      time: time.trim(),
      merchant: merchant ? merchant.trim() : null,
      transactionId: transactionId || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {initialData?._id ? "Edit Personal Expense" : "Add Personal Expense"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Track your individual everyday spending.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:text-sm">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:text-sm">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Groceries, Dinner, Fuel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:text-sm">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            {/* Time */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:text-sm">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 02:35 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Merchant Note if available */}
          {merchant && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-xs text-violet-700">
              <span className="font-semibold">Detected Payee:</span> {merchant}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95 disabled:bg-violet-400 sm:text-sm"
            >
              {loading
                ? "Saving..."
                : initialData?._id
                ? "Save Changes"
                : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
