import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  const joinGroup = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
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

      alert(res.data.message);

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
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
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Join Group
        </button>
      </div>
    </div>
  );
}

export default JoinGroup;