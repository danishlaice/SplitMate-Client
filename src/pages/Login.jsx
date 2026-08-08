import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { FaEye, FaEyeSlash , FaEnvelope ,FaLock } from "react-icons/fa";
import toast from "react-hot-toast";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-4">

      {/* Background Glow */}
      <div className="absolute -top-52 -left-52 w-[420px] h-[420px] bg-blue-800/10 rounded-full blur-3xl"></div>

<div className="absolute -bottom-52 -right-52 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl"></div>



      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-8">

        <div className="text-center mb-8">

  <div className="flex items-center justify-center gap-3">

   <div className="text-center">

  <h1 className="text-5xl font-light tracking-tight text-blue-400">
  Split<span className="font-semibold text-sky-500">Mate</span>
</h1>

  <p className="mt-3 text-slate-400 text-sm font-light tracking-wide">
  Split expenses with friends effortlessly.
</p>

</div>

  </div>

</div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
  <label className="block text-slate-300 mb-2">
    Email
  </label>

  <div className="relative">
    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />

    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    />
  </div>
</div>

          <div>
  <label className="block text-slate-300 mb-2">
    Password
  </label>

  <div className="relative">

    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />

    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 pl-11 pr-12 text-white placeholder-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>

  </div>
</div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-cyan-300 font-semibold transition"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;