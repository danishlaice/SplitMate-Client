import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUsers,
} from "react-icons/fa";
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#faf9ff] via-white to-[#f1f3ff] flex items-center justify-center px-4">

      {/* Background Glow */}
      <div className="absolute -top-52 -left-52 w-[420px] h-[420px] bg-violet-300/20 rounded-full blur-3xl"></div>

      <div className="absolute -bottom-52 -right-52 w-[420px] h-[420px] bg-blue-300/20 rounded-full blur-3xl"></div>

      {/* Top Left Dot Pattern */}
      <div
        className="absolute top-6 left-5 w-20 h-36 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8b7cf6 3px, transparent 4px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Bottom Right Dot Pattern */}
      <div
        className="absolute bottom-5 right-5 w-20 h-36 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8b7cf6 3px, transparent 4px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(79,70,229,0.15)] p-7 sm:p-8">

        {/* Logo */}
        <div className="text-center mb-7">

          <div className="flex items-center justify-center gap-2.5">

            {/* Logo Icon - Smaller */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FaUsers className="text-white text-2xl sm:text-3xl" />
            </div>

            {/* Logo Text - Smaller */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111a3a]">
              Split
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">
                Mate
              </span>
            </h1>

          </div>

          {/* Tagline */}
          <p className="mt-4 text-[#69779d] text-sm font-medium">
            Split expenses with friends effortlessly.
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>

            <label className="block text-[#111a3a] mb-2 font-semibold">
              Email
            </label>

            <div className="relative">

              <FaEnvelope
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-[#e5e0ff] rounded-xl px-4 py-3 pl-11 text-[#111a3a] placeholder-[#8792b2] outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />

            </div>

          </div>

          {/* Password */}
          <div>

            <label className="block text-[#111a3a] mb-2 font-semibold">
              Password
            </label>

            <div className="relative">

              <FaLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-[#e5e0ff] rounded-xl px-4 py-3 pl-11 pr-12 text-[#111a3a] placeholder-[#8792b2] outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b96b5] hover:text-violet-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

            </div>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 hover:scale-[1.02] shadow-lg shadow-violet-500/20"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register */}
        <p className="text-center text-[#69779d] mt-5">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-violet-600 hover:text-blue-600 font-semibold transition"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;