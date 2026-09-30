import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaSignOutAlt, FaWallet } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isPersonalActive = location.pathname === "/personal-expenses";
  const isHomeActive =
    location.pathname === "/dashboard" || location.pathname.startsWith("/group");

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-2xl font-bold tracking-tight text-black sm:text-3xl"
            style={{ fontFamily: "Comfortaa, sans-serif" }}
          >
            SplitMate
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2.5 sm:gap-6">

            {/* Home */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 pb-1 text-xs font-semibold transition sm:gap-2 sm:text-base ${
                isHomeActive
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-slate-600 hover:text-violet-600"
              }`}
            >
              <FaHome className="text-xs sm:text-sm" />
              Home
            </Link>

            {/* Personal Expenses */}
            <Link
              to="/personal-expenses"
              className={`flex items-center gap-1.5 pb-1 text-xs font-semibold transition sm:gap-2 sm:text-base ${
                isPersonalActive
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-slate-600 hover:text-violet-600"
              }`}
            >
             
              Personal 
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition duration-200 hover:bg-red-50 sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm"
            >
              <FaSignOutAlt className="text-xs sm:text-sm" />
              Logout
            </button>

          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
           

            {/* Content */}
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Logout?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to logout from SplitMate?
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;