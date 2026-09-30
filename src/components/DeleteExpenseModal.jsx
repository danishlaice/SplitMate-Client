import React from "react";
import { FaTrashAlt } from "react-icons/fa";

export default function DeleteExpenseModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "Delete Expense?",
  message = "Are you sure you want to delete this expense?",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <FaTrashAlt className="text-base" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              loading
                ? "cursor-not-allowed bg-rose-300"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
