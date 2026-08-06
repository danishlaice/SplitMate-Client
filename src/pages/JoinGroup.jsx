import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const joinGroup = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/");
      return;
    }

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

    toast.success("Joined Group Successfully");

    navigate(`/group/${res.data.groupId}`);

  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-lg text-center border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-4">
          Join Group
        </h1>

        <p className="text-slate-400 mb-4">
          Invite Code
        </p>

        <p className="text-green-400 text-2xl font-bold">
          {inviteCode}
        </p>

        <button
  onClick={joinGroup}
  disabled={loading}
  className={`mt-6 px-6 py-3 rounded-lg text-white font-semibold transition ${
    loading
      ? "bg-blue-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {loading ? "Joining..." : "Join Group"}
</button>
      </div>
    </div>
  );
}

export default JoinGroup;