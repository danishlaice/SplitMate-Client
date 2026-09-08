import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  FaEye,
  FaEyeSlash,
  FaUsers,
} from "react-icons/fa";
import {
  FiUser,
  FiMail,
  FiLock,
  FiUserPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/users/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Registration Successful");

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#faf9ff] via-white to-[#eef2ff] flex items-center justify-center px-4 py-6">

      {/* Background Glow */}
      <div className="absolute -top-44 -left-44 w-[360px] h-[360px] bg-violet-300/20 rounded-full blur-3xl"></div>

      <div className="absolute -bottom-44 -right-44 w-[360px] h-[360px] bg-blue-300/20 rounded-full blur-3xl"></div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-[350px] rounded-[28px] border border-white bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(79,70,229,0.15)] px-6 py-7 sm:px-7 sm:py-8">

        {/* Logo Section */}
        <div className="text-center mb-6">

          <div className="flex items-center justify-center gap-2">

            {/* Logo Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
              <FaUsers className="text-white text-2xl" />
            </div>

            {/* Logo Text */}
            <h1 className="text-[38px] leading-none font-semibold tracking-tight text-[#111a3a]">
              Split
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">
                Mate
              </span>
            </h1>

          </div>

          {/* Tagline */}
          <p className="mt-4 text-[#69779d] text-sm font-medium">
            Create your account and start splitting.
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div>

            <label className="block text-[15px] font-semibold text-slate-700 mb-2">
              Full Name
            </label>

            <div className="relative">

              <FiUser
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600 text-lg"
              />

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 bg-white border-2 border-[#e5e0ff] rounded-xl px-4 pl-11 text-[#111a3a] placeholder-[#8792b2] outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />

            </div>

          </div>

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

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 hover:scale-[1.01] shadow-lg shadow-violet-500/20"
            }`}
          >
            <FiUserPlus className="text-lg" />

            {loading ? "Creating Account..." : "Register"}

          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-[#69779d] mt-5 text-sm">

          Already have an account?{" "}

          <Link
            to="/"
            className="text-violet-600 hover:text-blue-600 font-semibold transition"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;