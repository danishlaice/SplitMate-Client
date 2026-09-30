import React from "react";
import { FaBell, FaTimes, FaPlus } from "react-icons/fa";

export default function SmartDetectionBanner({
  detectedExpense,
  onAddExpense,
  onDismiss,
}) {
  if (!detectedExpense) return null;

  return (
    <div className="mb-5 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50/50 p-4 shadow-sm transition-all sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Info */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-200">
            <FaBell className="text-sm" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                Payment Detected
              </span>
              <span className="text-xs text-slate-500">
                {detectedExpense.displayDate || detectedExpense.date} •{" "}
                {detectedExpense.time}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                {detectedExpense.merchant || "Payment"}
              </h3>
              <span className="text-lg font-extrabold text-violet-700">
                ₹{Number(detectedExpense.amount).toFixed(2)}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-slate-600">
              A payment notification was detected. Click below to quickly add it
              to your personal expenses.
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={() => onAddExpense(detectedExpense)}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 active:scale-95"
          >
            <FaPlus className="text-xs" />
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
