import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import QrScanner from "../components/QrScanner";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Dashboard() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

const [showScanner, setShowScanner] = useState(false);
const [loading, setLoading] = useState(false);

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
  if (!groupName.trim()) {
    toast.error("Please enter a group name");
    return;
  }

  try {
    setLoading(true);

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

    toast.success("Group Created Successfully");

    setGroupName("");

    navigate(`/group/${res.data.group._id}`);
  } catch (error) {
    toast.error(error.response?.data?.message || "Error creating group");
  } finally {
    setLoading(false);
  }
};
  const joinGroup = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.post(
      "/groups/join-by-code",
      {
        inviteCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   toast.success(res.data.message);

setInviteCode("");

fetchGroups();
} catch (error) {
  toast.error(error.response?.data?.message || "Error");
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
  disabled={loading}
  className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
    loading
      ? "bg-green-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {loading ? "Creating..." : "Create Group"}
</button>

          </div>

        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">

  <h2 className="text-2xl font-bold text-white mb-6">
    🤝 Join Group
  </h2>

  <div className="flex flex-col md:flex-row gap-4">

    <input
      type="text"
      placeholder="Enter Invite Code"
      value={inviteCode}
      onChange={(e) => setInviteCode(e.target.value)}
      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white"
    />

    <button
      onClick={joinGroup}
      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold"
    >
      Join Group
    </button>

  </div>
  <div className="mt-5">

  <button
    onClick={() => setShowScanner(true)}
    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
  >
    📷 Scan QR Code
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
      {showScanner && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-slate-900 p-6 rounded-2xl w-[90%] max-w-md">

      <h2 className="text-2xl font-bold text-white text-center mb-4">
        📷 Scan QR Code
      </h2>

    <QrScanner
  onScanSuccess={async (decodedText) => {
    setShowScanner(false);

    try {
      const token = localStorage.getItem("token");

      const inviteCode = decodedText.split("/").pop();

      const res = await API.post(
        "/groups/join-by-code",
        {
          inviteCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     toast.success(res.data.message);

navigate(`/group/${res.data.groupId}`);
} catch (error) {
  toast.error(error.response?.data?.message || "Unable to join group");
}
  }}
/>
      <button
        onClick={() => setShowScanner(false)}
        className="w-full mt-5 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
      >
        Cancel
      </button>

    </div>
  </div>
)}
    </>
  );
}

export default Dashboard;