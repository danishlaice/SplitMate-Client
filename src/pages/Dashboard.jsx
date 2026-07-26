import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroups(res.data.groups);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/groups/create",
        {
          name: groupName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      setGroupName("");
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating group");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">

        <h1 className="text-5xl font-bold text-white text-center mb-10">
          SplitMate Dashboard
        </h1>

        {/* Create Group */}

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold text-white mb-6">
            ➕ Create New Group
          </h2>

          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="Enter Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={createGroup}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-semibold transition"
            >
              Create Group
            </button>

          </div>

        </div>

        {/* Groups */}

        <div className="mt-10">

          <h2 className="text-3xl font-bold text-white mb-6">
            📂 My Groups
          </h2>

          {groups.length === 0 ? (

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
              No groups found.
            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {groups.map((group) => (

                <div
                  key={group._id}
                  className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300"
                >

                 <div className="flex items-center gap-3 mb-4">
  <span className="text-3xl">📁</span>

  <h3 className="text-2xl font-bold text-white">
    {group.name}
  </h3>
</div>

                  <p className="text-slate-400 mb-6">
                    👥 {group.members.length} Members
                  </p>

                 <Link
  to={`/group/${group._id}`}
  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
>
  Open Group →
</Link>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </>
  );
}

export default Dashboard;