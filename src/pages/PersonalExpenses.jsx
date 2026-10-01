import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEllipsisV,
  FaArrowLeft,
  FaCalendarAlt,
  FaBell,
  FaCheckCircle,
} from "react-icons/fa";
import PersonalExpenseModal from "../components/PersonalExpenseModal";
import DeleteExpenseModal from "../components/DeleteExpenseModal";
import SmartDetectionBanner from "../components/SmartDetectionBanner";
import notificationService from "../services/notificationService";
import { formatDisplayDate } from "../utils/notificationParser";

export default function PersonalExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 3-dot dropdown menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  // Smart Detection states
  const [smartDetectionEnabled, setSmartDetectionEnabled] = useState(
    notificationService.isEnabled()
  );
  const [detectedExpense, setDetectedExpense] = useState(null);
  const [showSmartSettings, setShowSmartSettings] = useState(false);
  const [customTestNotification, setCustomTestNotification] = useState(
    "Payment successful. ₹180 paid to ABC Store on UPI."
  );

  useEffect(() => {
    fetchPersonalExpenses();

    // Listen for detected expenses
    const unsubscribe = notificationService.subscribe((detected) => {
      setDetectedExpense(detected);
    });

    return () => unsubscribe();
  }, []);

  const fetchPersonalExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await API.get("/personal-expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(res.data.expenses || []);
      setMonthlyTotal(res.data.monthlyTotal || 0);
    } catch (error) {
      console.error("Failed to fetch personal expenses:", error);
      toast.error(
        error.response?.data?.message || "Failed to load personal expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async (formData) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");

      if (editingExpense?._id) {
        // Edit existing
        const res = await API.put(
          `/personal-expenses/${editingExpense._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(res.data.message || "Expense updated successfully");
      } else {
        // Create new
        const res = await API.post("/personal-expenses", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(res.data.message || "Expense added successfully");

        // If this was added from detected notification, dismiss the notification
        if (formData.transactionId) {
          notificationService.dismissTransaction(formData.transactionId);
          setDetectedExpense(null);
        }
      }

      setIsModalOpen(false);
      setEditingExpense(null);
      await fetchPersonalExpenses();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save personal expense"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");

      const res = await API.delete(`/personal-expenses/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message || "Expense deleted successfully");
      setDeleteId(null);
      await fetchPersonalExpenses();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete expense"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenAddModal = (detected = null) => {
    if (detected) {
      setEditingExpense({
        amount: detected.amount,
        description: "",
        date: detected.date,
        time: detected.time,
        merchant: detected.merchant,
        transactionId: detected.transactionId,
      });
    } else {
      setEditingExpense(null);
    }
    setIsModalOpen(true);
  };

  const handleToggleSmartDetection = async () => {
    const nextState = !smartDetectionEnabled;

    if (nextState) {
      // Request permission
      const result = await notificationService.requestPermission();
      if (result.status === "denied") {
        toast.error(
          "Notification permission was denied. You can enable it in your browser settings."
        );
      } else {
        toast.success("Smart Expense Detection enabled!");
      }
    } else {
      toast("Smart Expense Detection disabled", { icon: "ℹ️" });
      setDetectedExpense(null);
    }

    notificationService.setEnabled(nextState);
    setSmartDetectionEnabled(nextState);
  };

  const handleTestSimulateNotification = () => {
    if (!smartDetectionEnabled) {
      toast.error("Please enable Smart Expense Detection first.");
      return;
    }

    const detected = notificationService.processIncomingNotification(
      customTestNotification,
      "Payment Alert"
    );

    if (detected) {
      toast.success("Payment notification parsed successfully!");
    } else {
      toast.error(
        "Could not extract payment details from text. Please ensure it contains amount and merchant."
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-3 pt-5 pb-24 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Top Navigation & Breadcrumb */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800 sm:text-sm"
            >
              <FaArrowLeft className="text-xs" />
              Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setShowSmartSettings(!showSmartSettings)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FaBell
                className={`text-xs ${smartDetectionEnabled ? "text-violet-600" : "text-slate-400"
                  }`}
              />
              Smart Detection
            </button>
          </div>

          {/* Smart Detection Settings Drawer / Panel */}
          {showSmartSettings && (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Smart Expense Detection
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    SplitMate can detect payment notifications and help you
                    quickly add them as personal expenses without manual entry.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSmartDetection}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition sm:text-sm ${smartDetectionEnabled
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <FaCheckCircle
                    className={`text-xs ${smartDetectionEnabled ? "text-white" : "text-slate-300"
                      }`}
                  />
                  {smartDetectionEnabled ? "Enabled" : "Enable"}
                </button>
              </div>

              {/* Developer / Manual Test Trigger for Notification Reading */}
              {smartDetectionEnabled && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span className="block text-xs font-semibold text-slate-600">
                    Test Notification Detection (e.g. UPI / Bank Notification text):
                  </span>
                  <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={customTestNotification}
                      onChange={(e) => setCustomTestNotification(e.target.value)}
                      placeholder="e.g. Paid ₹180 to ABC Store"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleTestSimulateNotification}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                    >
                      Test Detection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detected Expense Banner */}
          <SmartDetectionBanner
            detectedExpense={detectedExpense}
            onAddExpense={handleOpenAddModal}
            onDismiss={() => {
              if (detectedExpense) {
                notificationService.dismissTransaction(
                  detectedExpense.transactionId
                );
              }
              setDetectedExpense(null);
            }}
          />

          {/* Header Card with Monthly Total and Add Button */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left Title & Month Total */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Personal Expenses
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    This Month
                  </h1>
                  <span className="text-2xl font-extrabold text-violet-600 sm:text-3xl">
                    ₹{Number(monthlyTotal).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Independent personal spending. Not linked to any group or shared balance.
                </p>
              </div>

              {/* Add Expense Button */}
              <button
                type="button"
                onClick={() => handleOpenAddModal(null)}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 active:scale-95"
              >
                <FaPlus className="text-xs" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Expense List Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  All Expenses
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {expenses.length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600"></div>
              </div>
            ) : expenses.length === 0 ? (
              /* Empty State */
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center sm:p-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-xl text-violet-600">
                  💳
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 sm:text-base">
                  No personal expenses yet.
                </h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Track your everyday spending here.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(null)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
                >
                  <FaPlus className="text-xs" />
                  Add Expense
                </button>
              </div>
            ) : (
              /* Expense List */
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const displayDateStr = formatDisplayDate(expense.date);

                  return (
                    <div
                      key={expense._id}
                      className="group relative rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-violet-200 hover:bg-violet-50/20 sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left Details */}
                        <div className="min-w-0 flex-1">
                          {/* Merchant if available */}
                          {expense.merchant && (
                            <span className="inline-block rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {expense.merchant}
                            </span>
                          )}

                          {/* Description */}
                          <h4 className="mt-0.5 break-words text-sm font-bold text-slate-900 sm:text-base">
                            {expense.description}
                          </h4>

                          {/* Date and Time */}
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <FaCalendarAlt className="text-[10px] text-slate-400" />
                            <span>
                              {displayDateStr} • {expense.time}
                            </span>
                          </div>
                        </div>

                        {/* Right: Amount & 3-Dot Action Menu */}
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-base font-bold text-slate-900 sm:text-lg">
                            ₹{Number(expense.amount).toFixed(2)}
                          </span>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === expense._id ? null : expense._id
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                              aria-label="Expense options"
                            >
                              <FaEllipsisV className="text-xs" />
                            </button>

                            {openMenuId === expense._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-9 z-50 w-28 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setEditingExpense(expense);
                                      setIsModalOpen(true);
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setDeleteId(expense._id);
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      <PersonalExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteExpenseModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteExpense}
        loading={deleteLoading}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense?"
      />
    </>
  );
}
