import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaSignOutAlt, FaUsers } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
       <Link
  to="/dashboard"
  className="text-3xl font-bold tracking-tight text-black"
  style={{ fontFamily: "Comfortaa, sans-serif" }}
>
  SplitMate
</Link>

        {/* Right Side */}
        <div className="flex items-center gap-6">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 border-b-2 border-violet-600 pb-1 text-base font-semibold text-violet-600 transition hover:text-violet-700"
          >
            <FaHome className="text-sm" />
            Dashboard
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-2.5 font-semibold text-red-600 transition duration-200 hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;