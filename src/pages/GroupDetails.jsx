import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
const [editDescription, setEditDescription] = useState("");
const [editAmount, setEditAmount] = useState("");

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
      console.log(error);
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

    setBalanceData(res.data);
  } catch (error) {
    console.log(error);
  }
};
const addMember = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.post(
      "/groups/add-member",
      {
        groupId: id,
        email: memberEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(res.data.message);

    setMemberEmail("");

    fetchGroup();
    fetchBalance();
  } catch (error) {
    alert(error.response?.data?.message || "Error");
  }
};

  const addExpense = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/expenses/add",
        {
          groupId: id,
          description,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      setDescription("");
      setAmount("");
      fetchExpenses();
      fetchBalance();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };
  const deleteExpense = async (expenseId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.delete(`/expenses/delete/${expenseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert(res.data.message);

    fetchExpenses();
    fetchBalance();
  } catch (error) {
    alert(error.response?.data?.message || "Error");
  }
};
const updateExpense = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.put(
      `/expenses/update/${editingId}`,
      {
        description: editDescription,
        amount: editAmount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(res.data.message);

    setEditingId(null);
    setEditDescription("");
    setEditAmount("");

    fetchExpenses();
    fetchBalance();
  } catch (error) {
    alert(error.response?.data?.message || "Error");
  }
};
const totalExpense = expenses.reduce((total, expense) => {
  return total + expense.amount;
}, 0);

  if (!group) {
    return (
      <>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "50px" }}>
          Loading...
        </h2>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-lg">

    <h1 className="text-5xl font-bold text-white mb-6">
      {group.name}
    </h1>

    <div className="flex justify-center gap-10 text-lg">

      <div className="text-slate-300">
        👥 Members
        <br />
        <span className="text-white font-semibold">
          {group.members.length}
        </span>
      </div>

      <div className="text-slate-300">
        💰 Total Expense
        <br />
        <span className="text-green-400 font-semibold">
          ₹ {totalExpense}
        </span>
      </div>

    </div>

  </div>
<div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">

  <h2 className="text-2xl font-bold text-white mb-6">
    👥 Group Members
  </h2>

  <div className="space-y-4">

    {group.members.map((member) => (
      <div
        key={member._id}
        className="flex justify-between items-center bg-slate-800 rounded-xl p-4"
      >
        <div>
          <h3 className="text-white font-semibold">
            {member.name}
          </h3>

          <p className="text-slate-400">
            {member.email}
          </p>
        </div>

        <span className="text-2xl">👤</span>
      </div>
    ))}

  </div>

</div>

<div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">

  <h2 className="text-2xl font-bold text-white mb-6">
    ➕ Add Member
  </h2>

  <div className="flex flex-col md:flex-row gap-4">

    <input
      type="email"
      placeholder="Enter member email"
      value={memberEmail}
      onChange={(e) => setMemberEmail(e.target.value)}
      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <button
      onClick={addMember}
      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold transition"
    >
      Add Member
    </button>

  </div>

</div>

       
        <hr />

<div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">

  <h2 className="text-2xl font-bold text-white mb-6">
    💰 Balance Summary
  </h2>

  <div className="space-y-4">

    {balanceData &&
      balanceData.balances.map((member) => (
        <div
          key={member.name}
          className="bg-slate-800 rounded-xl p-5 border border-slate-700"
        >
          <div className="flex justify-between items-center">

            <div>
              <h3 className="text-xl font-bold text-white">
                {member.name}
              </h3>

              <p className="text-slate-400">
                Paid: ₹ {member.paid}
              </p>

              <p className="text-slate-400">
                Should Pay: ₹ {member.shouldPay}
              </p>
            </div>

            <div>
              {member.balance > 0 ? (
                <span className="bg-green-600 px-4 py-2 rounded-lg text-white font-semibold">
                  Gets ₹{member.balance}
                </span>
              ) : member.balance < 0 ? (
                <span className="bg-red-600 px-4 py-2 rounded-lg text-white font-semibold">
                  Pays ₹{Math.abs(member.balance)}
                </span>
              ) : (
                <span className="bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold">
                  Settled
                </span>
              )}
            </div>

          </div>
        </div>
      ))}

  </div>

</div>

        <hr />

       <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">

  <h2 className="text-2xl font-bold text-white mb-6">
    ➕ Add Expense
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    <input
      type="text"
      placeholder="Expense Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      type="number"
      placeholder="Amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

  </div>

  <button
    onClick={addExpense}
    className="mt-6 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg text-white font-semibold transition"
  >
    Add Expense
  </button>

</div>
        <hr />

<div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">

  <h2 className="text-2xl font-bold text-white mb-6">
    💳 Expenses
  </h2>

  {expenses.length === 0 ? (

    <p className="text-slate-400">
      No expenses yet.
    </p>

  ) : (

    <div className="space-y-5">

      {expenses.map((expense) => (

        <div
          key={expense._id}
          className="bg-slate-800 border border-slate-700 rounded-xl p-5"
        >

          {editingId === expense._id ? (

            <>
              <div className="grid md:grid-cols-2 gap-4">

                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  className="bg-slate-700 rounded-lg px-4 py-3 text-white"
                />

                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) =>
                    setEditAmount(e.target.value)
                  }
                  className="bg-slate-700 rounded-lg px-4 py-3 text-white"
                />

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={updateExpense}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-white"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded-lg text-white"
                >
                  Cancel
                </button>

              </div>
            </>

          ) : (

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-bold text-white">
                  {expense.description}
                </h3>

                <p className="text-slate-400">
                  ₹ {expense.amount}
                </p>

                <p className="text-slate-500">
                  Paid by {expense.paidBy.name}
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  onClick={() => {
                    setEditingId(expense._id);
                    setEditDescription(expense.description);
                    setEditAmount(expense.amount);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteExpense(expense._id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
                >
                  Delete
                </button>

              </div>

            </div>

          )}

        </div>

      ))}

    </div>

  )}

</div>

      </div>
    </>
  );
}

export default GroupDetails;