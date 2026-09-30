import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { FaUserFriends, FaBars, FaTrashAlt } from "react-icons/fa";

function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [openExpenseMenu, setOpenExpenseMenu] = useState(null);
  const [settlingId, setSettlingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  const [clearExpensesLoading, setClearExpensesLoading] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const currentUserId = currentUser.id || currentUser._id;

  const requestMarkAsSettled = (item) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 py-0.5 text-white">
          <p className="text-sm font-semibold">
            Mark payment of ₹{Number(item.amount).toFixed(2)} from {item.from} as settled?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await markAsSettled(item.id);
              }}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Confirm Settled
            </button>
          </div>
        </div>
      ),
      {
        id: `settle-${item.id}`,
        duration: 7000,
      }
    );
  };

  const markAsSettled = async (settlementId) => {
    try {
      setSettlingId(settlementId);

      const token = localStorage.getItem("token");

      await API.put(
        `/balance/settlement/${settlementId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optimistically remove settled item from pending list
      setBalanceData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          settlements: prev.settlements.filter((s) => s.id !== settlementId),
        };
      });

      toast.success("Payment marked as settled!");

      await fetchBalance();
    } catch (error) {
      console.error(
        "Error settling payment:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Error settling payment");
    } finally {
      setSettlingId(null);
    }
  };

  const [deleteGroupLoading, setDeleteGroupLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  useEffect(() => {
    fetchGroup();
    fetchExpenses();
    fetchBalance();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroup(res.data.group);
    } catch (error) {
      console.error("Error fetching group:", error);
      toast.error(error.response?.data?.message || "Failed to load group");
      navigate("/dashboard");
    }
  };
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(res.data.expenses);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/expenses/balance/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);

      setBalanceData(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const addMember = async () => {
    if (!memberEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setAddMemberLoading(true);
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/groups/add-member",
        {
          groupId: id,
          email: memberEmail.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || "Member added successfully");
      setMemberEmail("");
      fetchGroup();
      fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding member");
    } finally {
      setAddMemberLoading(false);
    }
  };

  const addExpense = async () => {
    const numAmount = Number(amount);
    if (!description.trim() || !amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid description and positive amount");
      return;
    }

    try {
      setExpenseLoading(true);

      const token = localStorage.getItem("token");

      const res = await API.post(
        "/expenses/add",
        {
          groupId: id,
          description: description.trim(),
          amount: numAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Expense Added Successfully");

      setDescription("");
      setAmount("");

      fetchExpenses();
      fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding expense");
    } finally {
      setExpenseLoading(false);
    }
  };
  const deleteExpense = (expenseId, description) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 py-0.5 text-white">
          <p className="text-sm font-semibold">
            Delete {description ? `"${description}"` : "this expense"}?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await executeDeleteExpense(expenseId);
              }}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        id: `delete-expense-${expenseId}`,
        duration: 6000,
      }
    );
  };

  const executeDeleteExpense = async (expenseId) => {
    try {
      setDeleteLoading(expenseId);

      const token = localStorage.getItem("token");

      await API.delete(`/expenses/delete/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Expense Deleted Successfully");

      await fetchExpenses();
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting expense");
    } finally {
      setDeleteLoading(null);
    }
  };

  const promptClearAllExpenses = () => {
    if (expenses.length === 0) return;

    toast(
      (t) => (
        <div className="flex flex-col gap-2 py-0.5 text-white">
          <div className="flex items-center gap-2">
            <span className="text-base">🗑️</span>
            <p className="text-sm font-semibold">
              Clear all {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}?
            </p>
          </div>
          <p className="text-xs text-slate-300">
            This will permanently delete all recorded expenses and reset balances.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await clearAllExpenses();
              }}
              disabled={clearExpensesLoading}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              Clear All
            </button>
          </div>
        </div>
      ),
      {
        id: "clear-all-expenses-confirm",
        duration: 7000,
      }
    );
  };

  const clearAllExpenses = async () => {
    try {
      setClearExpensesLoading(true);

      const token = localStorage.getItem("token");

      try {
        const res = await API.delete(`/expenses/clear/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(res.data?.message || "All expenses cleared successfully");
      } catch (endpointError) {
        // If the backend endpoint is not yet deployed on remote server (404), fall back to deleting individual expenses
        if (endpointError.response?.status === 404 && expenses.length > 0) {
          await Promise.all(
            expenses.map((expense) =>
              API.delete(`/expenses/delete/${expense._id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
            )
          );
          toast.success("All expenses cleared successfully");
        } else {
          throw endpointError;
        }
      }

      setEditingId(null);
      setOpenExpenseMenu(null);

      await fetchExpenses();
      await fetchBalance();
    } catch (error) {
      console.error("Error clearing expenses:", error);
      toast.error(error.response?.data?.message || "Failed to clear expenses");
    } finally {
      setClearExpensesLoading(false);
    }
  };
  const updateExpense = async () => {
    const numAmount = Number(editAmount);
    if (!editDescription.trim() || !editAmount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid description and positive amount");
      return;
    }

    try {
      setUpdateLoading(true);

      const token = localStorage.getItem("token");

      const res = await API.put(
        `/expenses/update/${editingId}`,
        {
          description: editDescription.trim(),
          amount: numAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Expense Updated Successfully");

      setEditingId(null);
      setEditDescription("");
      setEditAmount("");

      await fetchExpenses();
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating expense");
    } finally {
      setUpdateLoading(false);
    }
  };
  const leaveGroup = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 py-0.5 text-white">
          <p className="text-sm font-semibold">
            Are you sure you want to leave this group?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await executeLeaveGroup();
              }}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Leave Group
            </button>
          </div>
        </div>
      ),
      {
        id: "leave-group-confirm",
        duration: 6000,
      }
    );
  };

  const executeLeaveGroup = async () => {
    try {
      setLeaveLoading(true);

      const token = localStorage.getItem("token");

      await API.post(
        "/groups/leave",
        {
          groupId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Left Group Successfully");

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error leaving group");
    } finally {
      setLeaveLoading(false);
    }
  };
  const deleteGroup = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 py-0.5 text-white">
          <p className="text-sm font-semibold">
            Permanently delete this group and all its expenses?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await confirmDeleteGroup();
              }}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Delete Group
            </button>
          </div>
        </div>
      ),
      {
        id: "delete-group-confirm",
        duration: 7000,
      }
    );
  };

  const confirmDeleteGroup = async () => {
    try {
      setDeleteGroupLoading(true);

      const token = localStorage.getItem("token");

      await API.delete("/groups/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          groupId: id,
        },
      });

      toast.success("Group deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.response?.data?.message || "Failed to delete group");
    } finally {
      setDeleteGroupLoading(false);
    }
  };

  const totalExpense = expenses.reduce((total, expense) => {
    return total + Number(expense.amount || 0);
  }, 0);
  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600"></div>

            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-3 pt-3 pb-24 sm:px-6 sm:py-6">




          {/* =========================
    Group Header
========================= */}

          <div className="relative z-0 mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
            {/* Group Menu */}
            <div className="absolute -right-3 -top-3 z-50">

              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
              >
                <FaBars className="text-sm" />
              </button>

              {openMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenMenu(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">

                    {String(group.createdBy?._id || group.createdBy) === String(currentUserId) ? (

                      <button
                        onClick={() => {
                          setOpenMenu(false);
                          deleteGroup();
                        }}
                        disabled={deleteGroupLoading}
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        {deleteGroupLoading ? "Deleting..." : "Delete Group"}
                      </button>

                    ) : (

                      <button
                        onClick={() => {
                          setOpenMenu(false);
                          leaveGroup();
                        }}
                        disabled={leaveLoading}
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        {leaveLoading ? "Leaving..." : "Leave Group"}
                      </button>

                    )}

                  </div>
                </>
              )}

            </div>


            {/* Group Name */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {group.name ? group.name.charAt(0).toUpperCase() + group.name.slice(1) : "Group"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your group expenses and balances.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">

              {/* Members */}
              <button
                type="button"
                onClick={() => setShowMembers(true)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
              >
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Members
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  {group.members.length}
                </p>
              </button>

              {/* Total Expense */}
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Total Expense
                </p>

                <p className="mt-1 text-xl font-bold text-violet-600 sm:text-2xl">
                  ₹ {Number(totalExpense).toFixed(2)}
                </p>
              </div>

            </div>
            {/* Invite Members Button */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-600 transition hover:border-violet-300 hover:bg-violet-100"
            >
              <FaUserFriends />
              Invite Members
            </button>

          </div>
          {/* =========================
    Invite Members Modal
========================= */}

          {showInviteModal && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
            >

              <div
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >

                {/* Header */}
                <div className="mb-5 flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Invite Members
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Share the invite code or scan the QR code to join this group.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ✕
                  </button>

                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <QRCodeCanvas
                      value={`${window.location.origin}/join/${group.inviteCode}`}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#111827"
                    />
                  </div>
                </div>

                {/* Invite Code */}
                <div className="mt-5">

                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Invite Code
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="truncate text-base font-bold tracking-[0.18em] text-slate-900 sm:text-lg">
                        {group.inviteCode}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(group.inviteCode);
                        toast.success("Invite Code Copied!");
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                      title="Copy Invite Code"
                    >
                      📋
                    </button>

                  </div>

                </div>

                {/* Copy Invite Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/join/${group.inviteCode}`
                    );
                    toast.success("Invite Link Copied!");
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  🔗 Copy Invite Link
                </button>

                {/* Add Member by Email */}
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Or add member by Email
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="email"
                      placeholder="member@example.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
                    />
                    <button
                      onClick={addMember}
                      disabled={addMemberLoading}
                      className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                    >
                      {addMemberLoading ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* =========================
    Add Expense
========================= */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-6 sm:p-6">

            {/* Header */}
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Add Expense
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Add a new expense and split it with your group.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid gap-3 sm:grid-cols-2">

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">
                  Description
                </label>

                <input
                  type="text"
                  placeholder="e.g. Dinner, Hotel, Taxi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">
                  Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
              </div>

            </div>

            {/* Add Button */}
            <button
              onClick={addExpense}
              disabled={expenseLoading}
              className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white transition sm:w-auto sm:px-8 ${expenseLoading
                  ? "cursor-not-allowed bg-emerald-400"
                  : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
              {expenseLoading ? "Adding..." : "Add Expense"}
            </button>

          </div>








          {/* Settlement Suggestions */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-6 sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Settlement
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Settle pending payments between group members.
              </p>
            </div>

            {balanceData?.settlements?.length > 0 ? (
              <div className="space-y-3">
                {balanceData.settlements.map((item) => {
                  const isReceiver = String(currentUserId) === String(item.toId);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >

                      {/* From → To */}
                      <div className="flex items-start gap-3">

                        {/* From */}
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            From
                          </p>

                          <p className="break-words text-[13px] font-semibold leading-5 text-slate-800">
                            {item.from}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex h-9 w-9 shrink-0 translate-y-4 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                          →
                        </div>

                        {/* To */}
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            To
                          </p>

                          <p className="break-words text-[13px] font-semibold leading-5 text-slate-800">
                            {item.to}
                          </p>
                        </div>

                      </div>
                      {/* Amount + Status */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">

                        {/* Amount */}
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Amount
                          </p>

                          <p className="mt-0.5 text-lg font-bold text-violet-600">
                            ₹{Number(item.amount).toFixed(2)}
                          </p>
                        </div>

                        {/* Status */}
                        {isReceiver ? (

                          <button
                            onClick={() => requestMarkAsSettled(item)}
                            disabled={settlingId === item.id}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95 sm:text-sm"
                          >
                            {settlingId === item.id
                              ? "Updating..."
                              : "Mark as Settled"}
                          </button>

                        ) : (

                          <span className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 sm:text-sm">
                            Pending
                          </span>

                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            ) : (

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-600">
                  🎉 Everyone is settled.
                </p>
              </div>

            )}

            {/* Optional Collapsible History */}
            {balanceData?.history?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
                >
                  <span>
                    {showHistory ? "▼ Hide" : "▶ View"} Settlement History ({balanceData.history.length})
                  </span>
                </button>

                {showHistory && (
                  <div className="mt-3 space-y-2">
                    {balanceData.history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5"
                      >
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {item.from}
                          </span>
                          {" → "}
                          <span className="font-semibold text-slate-800">
                            {item.to}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            ₹{Number(item.amount).toFixed(2)}
                          </span>
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                            Settled ✓
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>




          {/* =========================
    Expenses
========================= */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Expenses
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {expenses.length}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  All expenses added to this group.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  {expenses.length} {expenses.length === 1 ? "Expense" : "Expenses"}
                </span>

                {expenses.length > 0 && (
                  <button
                    type="button"
                    onClick={promptClearAllExpenses}
                    disabled={clearExpensesLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 active:scale-95 disabled:opacity-50"
                    title="Clear all expenses"
                  >
                    <FaTrashAlt className="text-xs" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

            </div>

            {expenses.length === 0 ? (

              /* Empty State */
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center sm:p-8">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-xl text-violet-600">
                  💳
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  No expenses yet
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Add your first expense using the form above.
                </p>

              </div>

            ) : (

              <>
                <div className="space-y-3">

                  {(showAllExpenses
                    ? expenses
                    : expenses.slice(0, 3).concat(
                      editingId && expenses.findIndex((e) => e._id === editingId) >= 3
                        ? [expenses.find((e) => e._id === editingId)]
                        : []
                    )
                  ).map((expense) => (

                    <div
                      key={expense._id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-violet-200 hover:bg-violet-50/20 sm:p-4"
                    >

                      {editingId === expense._id ? (

                        /* Edit Expense */
                        <div className="space-y-3">

                          <div className="grid gap-2.5 sm:grid-cols-2">

                            <div>
                              <label className="mb-1 block text-xs font-semibold text-slate-600">
                                Description
                              </label>
                              <input
                                type="text"
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
                                placeholder="e.g. Dinner, Taxi"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-semibold text-slate-600">
                                Amount
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                  ₹
                                </span>

                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) =>
                                    setEditAmount(e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                          </div>

                          <div className="flex items-center gap-2 pt-1">

                            <button
                              onClick={updateExpense}
                              disabled={updateLoading}
                              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition sm:flex-none sm:px-6 sm:text-sm ${updateLoading
                                  ? "cursor-not-allowed bg-emerald-400"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                              {updateLoading ? "Saving..." : "Save"}
                            </button>

                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:flex-none sm:px-6 sm:text-sm"
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        /* Expense Details - Mobile First Two-Column Layout */
                        <div className="flex items-start justify-between gap-3">

                          {/* Left Column: Description + Meta */}
                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="break-words text-sm font-bold text-slate-900 sm:text-base">
                                {expense.description}
                              </h3>

                              {expense.isSettled ? (
                                <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                                  Settled ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                  Active
                                </span>
                              )}
                            </div>

                            {/* Subtext: Paid by & Date */}
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                              <span>
                                Paid by{" "}
                                <span className="font-semibold text-slate-700">
                                  {expense.paidBy?.name || "Unknown"}
                                </span>
                              </span>

                              {expense.createdAt && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400">
                                    {new Date(expense.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                </>
                              )}
                            </div>

                          </div>

                          {/* Right Column: Amount + Action Menu */}
                          <div className="flex shrink-0 items-center gap-1 sm:gap-2">

                            <div className="text-right">
                              <p className="text-sm font-bold text-violet-600 sm:text-base">
                                ₹{Number(expense.amount).toFixed(2)}
                              </p>
                            </div>

                            {/* Three Dot Menu */}
                            {(() => {
                              const isPayer = String(currentUserId) === String(expense.paidBy?._id || expense.paidBy);
                              const isOwner = String(group.createdBy?._id || group.createdBy) === String(currentUserId);
                              const canDelete = isPayer || isOwner;

                              if (!isPayer && !canDelete) return null;

                              return (
                                <div className="relative">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenExpenseMenu(
                                        openExpenseMenu === expense._id
                                          ? null
                                          : expense._id
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold text-slate-400 transition hover:bg-white hover:text-slate-700 active:scale-95"
                                    aria-label="Expense actions"
                                  >
                                    ⋮
                                  </button>

                                  {openExpenseMenu === expense._id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setOpenExpenseMenu(null)}
                                      />
                                      <div className="absolute right-0 top-10 z-50 w-28 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                                        {isPayer && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenExpenseMenu(null);
                                              setEditingId(expense._id);
                                              setEditDescription(expense.description);
                                              setEditAmount(expense.amount);
                                            }}
                                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm"
                                          >
                                            Edit
                                          </button>
                                        )}

                                        {canDelete && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenExpenseMenu(null);
                                              deleteExpense(expense._id, expense.description);
                                            }}
                                            disabled={deleteLoading === expense._id}
                                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 sm:text-sm"
                                          >
                                            {deleteLoading === expense._id ? "Deleting..." : "Delete"}
                                          </button>
                                        )}

                                      </div>
                                    </>
                                  )}

                                </div>
                              );
                            })()}

                          </div>

                        </div>

                      )}

                    </div>

                  ))}

                </div>

                {/* View All / Hide Button */}
                {expenses.length > 3 && (
                  <div className="mt-4 flex items-center justify-center border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAllExpenses((prev) => !prev)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 active:scale-95 sm:text-sm"
                    >
                      {showAllExpenses ? (
                        <>
                          <span>▲</span>
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <span>▼</span>
                          <span>View all expenses ({expenses.length})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>

            )}

          </div>
          {showMembers && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
              onClick={() => setShowMembers(false)}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Group Members
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {group.members.length} members in this group
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMembers(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Members */}
                <div className="max-h-[60vh] space-y-2.5 overflow-y-auto">
                  {group.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">

                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                          {member.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name only */}
                        <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                          {member.name}
                        </h3>

                      </div>

                      <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                        👤
                      </span>
                    </div>
                  ))}
                </div>

                {/* Close */}
                <button
                  onClick={() => setShowMembers(false)}
                  className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}




        </div>
      </div>
    </>
  );
}

export default GroupDetails;