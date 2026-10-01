import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  FaEye,
  FaEyeSlash,

  FaUsers,
} from "react-icons/fa";
import {
  FiMail,
  FiLock,
  FiLogIn,
} from "react-icons/fi";
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
      console.log("LOGIN ERROR:", error);
      console.log("LOGIN RESPONSE:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f0edff] via-[#faf9ff] to-[#e9efff] flex items-center justify-center px-4 py-6">

      {/* Background Glow */}
      <div className="absolute -top-44 -left-44 w-[360px] h-[360px] bg-violet-300/20 rounded-full blur-3xl"></div>

      <div className="absolute -bottom-44 -right-44 w-[360px] h-[360px] bg-blue-300/20 rounded-full blur-3xl"></div>



      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[350px] rounded-[28px] border border-white bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(79,70,229,0.20)] px-6 py-7 sm:px-7 sm:py-8">

        {/* Logo Section */}
        <div className="text-center mb-6">

          <div className="flex items-center justify-center gap-2">



            {/* Logo Text */}
            <h1
              className="text-[38px] leading-none font-semibold tracking-tight text-[#111a3a]"
              style={{ fontFamily: "Comfortaa, sans-serif" }}
            >
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

            <label className="block text-[15px] font-semibold text-slate-700 mb-2">
              Email
            </label>

            <div className="relative">

              <FiMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600 text-lg"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white border-2 border-[#e5e0ff] rounded-xl px-4 pl-11 text-[#111a3a] placeholder-[#8792b2] outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />

            </div>

          </div>

          {/* Password */}
          <div>

            <label className="block text-[15px] font-semibold text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">

              <FiLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600 text-lg"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white border-2 border-[#e5e0ff] rounded-xl px-4 pl-11 pr-12 text-[#111a3a] placeholder-[#8792b2] outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
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
          <div className="flex justify-end -mt-2">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-violet-600 hover:text-blue-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${loading
              ? "bg-violet-400 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 hover:scale-[1.01] shadow-lg shadow-violet-500/20"
              }`}
          >
            <FiLogIn className="text-lg" />
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register */}
        <p className="text-center text-[#69779d] mt-5 text-sm">

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