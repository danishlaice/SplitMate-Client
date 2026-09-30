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
  FaEllipsisV,
  FaTimes,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";

function Dashboard() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [inviteCode, setInviteCode] = useState("");

  const [activePanel, setActivePanel] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [renameGroupId, setRenameGroupId] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const [deleteGroupId, setDeleteGroupId] = useState(null);
  const [deleteGroupName, setDeleteGroupName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [leaveGroupId, setLeaveGroupId] = useState(null);
  const [leaveGroupName, setLeaveGroupName] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);

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
  const handleDeleteGroup = async () => {
  try {
    setDeleteLoading(true);

    const token = localStorage.getItem("token");

    const res = await API.delete("/groups/delete", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        groupId: deleteGroupId,
      },
    });

    toast.success("Group Deleted Successfully");

    // Remove deleted group from dashboard
    setGroups((currentGroups) =>
      currentGroups.filter(
        (group) => group._id !== deleteGroupId
      )
    );

    setDeleteGroupId(null);
    setDeleteGroupName("");

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error deleting group"
    );
  } finally {
    setDeleteLoading(false);
  }
};
const handleLeaveGroup = async () => {
  try {
    setLeaveLoading(true);

    const token = localStorage.getItem("token");

    const res = await API.post(
      "/groups/leave",
      {
        groupId: leaveGroupId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message);

    setGroups((currentGroups) =>
      currentGroups.filter(
        (group) => group._id !== leaveGroupId
      )
    );

    setLeaveGroupId(null);
    setLeaveGroupName("");

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Unable to leave group"
    );
  } finally {
    setLeaveLoading(false);
  }
};

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setCurrentUserId(user.id);
    }

    fetchGroups();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenu(null);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
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
  const filteredGroups = groups.filter((group) =>
  group.name.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <>
      <Navbar />

     <main className="relative min-h-screen bg-slate-50 px-3 pt-5 pb-24 sm:px-6 sm:py-8 lg:px-8">
        {/* Background Glow */}

       
        <div className="relative z-10 mx-auto max-w-7xl">

          {/* =========================
              Action Buttons
          ========================= */}

         <div className="flex gap-2 sm:gap-3">

  {/* Create Group */}
  <button
    onClick={() => handlePanel("create")}
    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all duration-300 sm:flex-none sm:gap-2 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base ${
      activePanel === "create"
        ? "bg-violet-700 text-white shadow-md shadow-violet-200"
        : "bg-violet-600 text-white shadow-sm hover:bg-violet-700 hover:-translate-y-0.5"
    }`}
  >
    <FaPlus />
    Create Group
  </button>

  {/* Join Group */}
  <button
    onClick={() => handlePanel("join")}
    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all duration-300 sm:flex-none sm:gap-2 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base ${
      activePanel === "join"
        ? "border-emerald-300 bg-emerald-50 text-emerald-600"
        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
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
  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

    <div className="mb-5 flex items-start justify-between gap-4">

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <FaPlus />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Create a New Group
          </h2>

          <p className="text-sm text-slate-500">
            Create a group to start sharing expenses.
          </p>
        </div>

      </div>

      <button
        onClick={() => setActivePanel(null)}
        className="text-slate-400 transition hover:text-slate-700"
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
        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
      />

      <button
        onClick={createGroup}
        disabled={loading}
        className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
          loading
            ? "cursor-not-allowed bg-violet-400"
            : "bg-violet-600 hover:bg-violet-700"
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
  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

    {/* Header */}
    <div className="mb-6 flex items-start justify-between gap-4">

      <div className="flex items-center gap-3">

        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <FaUserFriends className="text-lg" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Join a Group
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Enter an invite code or scan a QR code.
          </p>
        </div>

      </div>

      {/* Close */}
      <button
        onClick={() => setActivePanel(null)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <FaTimes className="text-sm" />
      </button>

    </div>

    {/* Invite Code + QR Scanner */}
    <div className="flex items-center gap-2.5">

      {/* Invite Code */}
      <input
        type="text"
        placeholder="Enter invite code"
        value={inviteCode}
        onChange={(e) =>
          setInviteCode(e.target.value.toUpperCase())
        }
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase tracking-wider text-slate-800 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />

      {/* QR Scanner */}
      <button
        onClick={() => setShowScanner(true)}
        className="flex h-[46px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
        title="Scan QR Code"
      >
        <FaQrcode className="text-lg" />
      </button>

    </div>

    {/* Join Group Button */}
    <button
      onClick={joinGroup}
      disabled={joinLoading}
      className={`mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white transition ${
        joinLoading
          ? "cursor-not-allowed bg-emerald-400"
          : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {joinLoading ? "Joining..." : "Join Group"}
    </button>

  </div>
)}

          {/* =========================
              My Groups
          ========================= */}

          {/* =========================
    My Groups
========================= */}

<section className="mt-10 sm:mt-12">

  {/* Header */}
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

    <div className="flex items-center justify-between sm:block">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          My Groups
        </h2>

        <p className="mt-1 hidden text-sm text-slate-500 sm:block">
          Your groups and shared expenses.
        </p>
      </div>

      {/* Mobile group count */}
      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:hidden">
        {groups.length} {groups.length === 1 ? "Group" : "Groups"}
      </span>
    </div>

    {/* Search + Count */}
    <div className="flex items-center gap-2">

      {/* Search */}
      <div className="relative flex-1 sm:w-64 sm:flex-none">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
        />
      </div>

      {/* Desktop group count */}
      <span className="hidden whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 sm:block">
        {groups.length} {groups.length === 1 ? "Group" : "Groups"}
      </span>

    </div>
  </div>


  {/* No Groups */}
  {groups.length === 0 ? (

    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">

      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-xl text-violet-600">
        <FaUsers />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        No groups yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Create your first group or join an existing group
        using an invite code.
      </p>

    </div>

  ) : filteredGroups.length === 0 ? (

    /* No Search Results */
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        No groups found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Try searching with a different group name.
      </p>
    </div>

  ) : (

    /* Group Cards */
    <div className="flex flex-col gap-3">

      {filteredGroups.map((group) => (

        <div
          key={group._id}
          className={`group relative rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-md sm:rounded-2xl sm:px-5 sm:py-4 ${
            openMenu === group._id ? "z-50" : "z-10"
          }`}
        >

          {/* Three Dot Menu */}
          <div
            className="absolute right-2.5 top-2.5 z-50 sm:right-3 sm:top-3"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() =>
                setOpenMenu(
                  openMenu === group._id ? null : group._id
                )
              }
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FaEllipsisV className="text-xs" />
            </button>

            {openMenu === group._id && (
              <div className="absolute right-0 top-9 z-[60] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">

                {/* Rename */}
                {String(group.createdBy) === String(currentUserId) && (
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      setRenameGroupId(group._id);
                      setRenameName(group.name);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span>✏️</span>
                    Rename
                  </button>
                )}

                {/* Copy Invite */}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        group.inviteCode
                      );

                      setOpenMenu(null);
                      toast.success("Invite code copied");
                    } catch (error) {
                      toast.error("Unable to copy invite code");
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>🔗</span>
                  Copy Invite Code
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Delete / Leave */}
                {String(group.createdBy) === String(currentUserId) ? (
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      setDeleteGroupId(group._id);
                      setDeleteGroupName(group.name);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <span>🗑️</span>
                    Delete Group
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      setLeaveGroupId(group._id);
                      setLeaveGroupName(group.name);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <span>🚪</span>
                    Leave Group
                  </button>
                )}

              </div>
            )}

          </div>


          {/* Group Content */}
          <div className="pr-8">

            {/* Group Name */}
            <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
              {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
            </h3>


            {/* Members + Created */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 sm:text-sm">

              

              

              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-slate-400" />

                Created on{" "}
                {new Date(group.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

            </div>


            {/* Divider */}
            <div className="my-2.5 border-t border-slate-100 sm:my-3" />


            {/* Bottom Row */}
            <div className="flex items-center justify-between gap-3">

              {/* Total Spent */}
              <div>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Total Spent
                </p>

                <p className="mt-0.5 text-xl font-bold text-violet-600 sm:text-2xl">
                  ₹0
                </p>
              </div>


              {/* Open Group */}
              <Link
                to={`/group/${group._id}`}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-600 transition-all duration-300 hover:border-violet-300 hover:bg-violet-100 sm:rounded-xl sm:px-6 sm:py-3"
              >
                Open Group
                <FaArrowRight className="text-xs sm:text-sm" />
              </Link>

            </div>

          </div>

        </div>

      ))}

    </div>

  )}

</section>

        </div>

        {/* =========================
    Rename Group Modal
========================= */}

{renameGroupId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

      {/* Header */}

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Rename Group
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter a new name for your group.
          </p>
        </div>

        <button
          onClick={() => {
            setRenameGroupId(null);
            setRenameName("");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <FaTimes />
        </button>

      </div>

      {/* Input */}

      <input
        type="text"
        value={renameName}
        onChange={(e) => setRenameName(e.target.value)}
        placeholder="Enter group name"
        autoFocus
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
      />

      {/* Buttons */}

      <div className="mt-5 flex justify-end gap-3">

        <button
          onClick={() => {
            setRenameGroupId(null);
            setRenameName("");
          }}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          disabled={renameLoading}
          onClick={async () => {

            if (!renameName.trim()) {
              toast.error("Please enter a group name");
              return;
            }

            try {
              setRenameLoading(true);

              const token = localStorage.getItem("token");

              const res = await API.put(
                "/groups/rename",
                {
                  groupId: renameGroupId,
                  name: renameName.trim(),
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              // Update group name immediately
              setGroups((currentGroups) =>
                currentGroups.map((group) =>
                  group._id === renameGroupId
                    ? {
                        ...group,
                        name: res.data.group.name,
                      }
                    : group
                )
              );

              toast.success(res.data.message);

              setRenameGroupId(null);
              setRenameName("");

            } catch (error) {

              toast.error(
                error.response?.data?.message ||
                  "Unable to rename group"
              );

            } finally {
              setRenameLoading(false);
            }

          }}
          className={`rounded-xl px-5 py-2.5 font-semibold text-white transition ${
            renameLoading
              ? "cursor-not-allowed bg-violet-400"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {renameLoading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>

  </div>
)}

{deleteGroupId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

      <h2 className="text-xl font-bold text-slate-900">
        Delete Group?
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-700">
          "{deleteGroupName}"
        </span>
        ? 
      </p>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => {
            setDeleteGroupId(null);
            setDeleteGroupName("");
          }}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteGroup}
          disabled={deleteLoading}
          className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:bg-red-400"
        >
          {deleteLoading ? "Deleting..." : "Delete Group"}
        </button>

      </div>

    </div>

  </div>
)}
{/* Leave Group Modal */}

{leaveGroupId && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

      <h2 className="text-xl font-bold text-slate-900">
        Leave Group?
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Are you sure you want to leave{" "}
        <span className="font-semibold text-slate-700">
          "{leaveGroupName}"
        </span>
        ?
      </p>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => {
            setLeaveGroupId(null);
            setLeaveGroupName("");
          }}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleLeaveGroup}
          disabled={leaveLoading}
          className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:bg-red-400"
        >
          {leaveLoading ? "Leaving..." : "Leave Group"}
        </button>

      </div>

    </div>

  </div>
)}

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