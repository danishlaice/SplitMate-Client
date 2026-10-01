import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaUsers, FaCreditCard } from "react-icons/fa";
import safeStorage from "../utils/storage";
import BottomNav from "./BottomNav";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    safeStorage.removeItem("token");
    safeStorage.removeItem("user");
    navigate("/");
  };

  const isPersonalActive = location.pathname === "/personal-expenses";
  const isGroupsActive =
    location.pathname === "/dashboard" || location.pathname.startsWith("/group");

  return (
    <>
      {/* Top Navbar */}
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
          <div className="flex items-center gap-3 sm:gap-6">

            {/* Desktop Navigation Links - hidden on mobile, visible on md+ */}
            <div className="hidden md:flex items-center gap-6">
              {/* Groups */}
              <Link
                to="/dashboard"
                id="desktop-nav-groups"
                className={`flex items-center gap-2 pb-1 text-sm font-semibold transition ${
                  isGroupsActive
                    ? "border-b-2 border-violet-600 text-violet-600"
                    : "text-slate-600 hover:text-violet-600"
                }`}
              >
                <FaUsers className="text-sm" />
                Groups
              </Link>

              {/* Personal Expenses */}
              <Link
                to="/personal-expenses"
                id="desktop-nav-personal"
                className={`flex items-center gap-2 pb-1 text-sm font-semibold transition ${
                  isPersonalActive
                    ? "border-b-2 border-violet-600 text-violet-600"
                    : "text-slate-600 hover:text-violet-600"
                }`}
              >
                <FaCreditCard className="text-sm" />
                Personal
              </Link>
            </div>

            {/* Logout Button - Always visible in top-right */}
            <button
              onClick={handleLogout}
              id="top-logout-btn"
              className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition duration-200 hover:bg-red-50 sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm"
            >
              <FaSignOutAlt className="text-xs sm:text-sm" />
              Logout
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

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