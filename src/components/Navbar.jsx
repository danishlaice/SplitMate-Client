import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="text-3xl font-bold text-blue-500 hover:text-blue-400 transition"
        >
          SplitMate
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-slate-300 hover:text-white transition font-medium"
          >
            Dashboard
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;