import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import QrScanner from "../components/QrScanner";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaUserFriends,
  FaQrcode,
  FaUsers,
  FaArrowRight,
  FaLayerGroup,
  FaTimes,
} from "react-icons/fa";

function Dashboard() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [inviteCode, setInviteCode] = useState("");

  const [activePanel, setActivePanel] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const navigate = useNavigate();

  // =========================
  // Fetch Groups
  // =========================

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

  // =========================
  // Create Group
  // =========================

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
      setActivePanel(null);

      navigate(`/group/${res.data.group._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error creating group"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Join Group
  // =========================

  const joinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    try {
      setJoinLoading(true);

      const token = localStorage.getItem("token");

      const res = await API.post(
        "/groups/join-by-code",
        {
          inviteCode: inviteCode.trim().toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);

      setInviteCode("");
      setActivePanel(null);

      navigate(`/group/${res.data.groupId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to join group"
      );
    } finally {
      setJoinLoading(false);
    }
  };

  // =========================
  // Panel Toggle
  // =========================

  const handlePanel = (panel) => {
    setActivePanel((current) =>
      current === panel ? null : panel
    );
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-8 sm:px-6 lg:px-8">

        {/* Background Glow */}

        <div className="pointer-events-none absolute -top-52 -left-52 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-52 -right-52 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* =========================
              Action Buttons
          ========================= */}

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Create Group */}

            <button
              onClick={() => handlePanel("create")}
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 ${
  activePanel === "create"
    ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-violet-900/20"
    : "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-violet-900/20 hover:from-blue-500 hover:to-violet-500 hover:-translate-y-0.5"
}`}
            >
              <FaPlus />
              Create Group
            </button>

            {/* Join Group */}

            <button
              onClick={() => handlePanel("join")}
             className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-all duration-300 ${
  activePanel === "join"
    ? "border-violet-500/50 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-900/10"
    : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-blue-500/50 hover:text-blue-300"
}`}
            >
              <FaUserFriends />
              Join Group
            </button>

          </div>

          {/* =========================
              Create Group Panel
          ========================= */}

          {activePanel === "create" && (
            <div className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">

              <div className="mb-5 flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <FaPlus />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Create a New Group
                    </h2>

                    <p className="text-sm text-slate-400">
                      Create a group to start sharing expenses.
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setActivePanel(null)}
                  className="text-slate-500 transition hover:text-white"
                >
                  <FaTimes />
                </button>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  onClick={createGroup}
                  disabled={loading}
                  className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
                    loading
                      ? "cursor-not-allowed bg-blue-500/50"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Creating..." : "Create Group"}
                </button>

              </div>

            </div>
          )}

          {/* =========================
              Join Group Panel
          ========================= */}

          {activePanel === "join" && (
            <div className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">

              <div className="mb-5 flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <FaUserFriends />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Join a Group
                    </h2>

                    <p className="text-sm text-slate-400">
                      Enter an invite code or scan a QR code.
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setActivePanel(null)}
                  className="text-slate-500 transition hover:text-white"
                >
                  <FaTimes />
                </button>

              </div>

              {/* Invite Code */}

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) =>
                    setInviteCode(e.target.value.toUpperCase())
                  }
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 uppercase tracking-wider text-white placeholder-slate-500 placeholder:normal-case placeholder:tracking-normal outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />

                <button
                  onClick={joinGroup}
                  disabled={joinLoading}
                  className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
                    joinLoading
                      ? "cursor-not-allowed bg-cyan-500/50"
                      : "bg-cyan-600 hover:bg-cyan-700"
                  }`}
                >
                  {joinLoading ? "Joining..." : "Join Group"}
                </button>

              </div>

              {/* OR */}

              <div className="my-5 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-700" />

                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Or
                </span>

                <div className="h-px flex-1 bg-slate-700" />

              </div>

              {/* QR Button */}

              <button
                onClick={() => setShowScanner(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 py-3 font-semibold text-slate-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300"
              >
                <FaQrcode />
                Scan QR Code
              </button>

            </div>
          )}

          {/* =========================
              My Groups
          ========================= */}

          <section className="mt-10">

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <FaLayerGroup className="text-blue-400" />
                  My Groups
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your groups and shared expenses.
                </p>

              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300">
                {groups.length}{" "}
                {groups.length === 1 ? "Group" : "Groups"}
              </span>

            </div>

            {/* =========================
                No Groups
            ========================= */}

            {groups.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-10 text-center shadow-xl">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-xl text-blue-400">
                  <FaUsers />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  No groups yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                  Create your first group or join an existing
                  group using an invite code.
                </p>

              </div>

            ) : (

              /* =========================
                 Group Cards
              ========================= */

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {groups.map((group) => (

                  <div
                    key={group._id}
                    className="group rounded-2xl border border-slate-700/70 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-blue-950/30"
                  >

                    {/* Card Top */}

                    <div className="mb-5 flex items-start justify-between">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <FaLayerGroup />
                      </div>

                      <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                        GROUP
                      </span>

                    </div>

                    {/* Group Name */}

                    <h3 className="truncate text-xl font-semibold text-white">
                      {group.name}
                    </h3>

                    {/* Members */}

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <FaUsers className="text-slate-500" />
                      {group.members.length} Members
                    </p>

                    {/* Open Group */}

                    <Link
  to={`/group/${group._id}`}
 className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-500 hover:to-violet-500 hover:shadow-lg hover:shadow-violet-900/20"
>
  Open Group
  <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
</Link>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

        {/* =========================
            QR Scanner Modal
        ========================= */}

        {showScanner && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <FaQrcode className="text-purple-400" />
                  Scan QR Code
                </h2>

                <button
                  onClick={() => setShowScanner(false)}
                  className="text-2xl text-slate-500 transition hover:text-white"
                >
                  ×
                </button>

              </div>

              <QrScanner
                onScanSuccess={async (decodedText) => {
                  setShowScanner(false);

                  try {
                    const token = localStorage.getItem("token");

                    const scannedInviteCode =
                      decodedText.split("/").pop();

                    const res = await API.post(
                      "/groups/join-by-code",
                      {
                        inviteCode: scannedInviteCode,
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
                    toast.error(
                      error.response?.data?.message ||
                        "Unable to join group"
                    );
                  }
                }}
              />

              <button
                onClick={() => setShowScanner(false)}
                className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </main>
    </>
  );
}

export default Dashboard;