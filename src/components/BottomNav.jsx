import { Link, useLocation } from "react-router-dom";
import { FaUsers, FaCreditCard } from "react-icons/fa";

function BottomNav() {
  const location = useLocation();

  const isPersonalActive = location.pathname === "/personal-expenses";
  const isGroupsActive =
    location.pathname === "/dashboard" || location.pathname.startsWith("/group");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
        {/* Groups */}
        <Link
          to="/dashboard"
          id="mobile-nav-groups"
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
            isGroupsActive
              ? "text-violet-600 font-semibold"
              : "text-slate-500 hover:text-slate-700 font-medium"
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-full px-4 py-1 transition-colors duration-200 ${
              isGroupsActive ? "bg-violet-100 text-violet-600" : "text-slate-500"
            }`}
          >
            <FaUsers className="text-lg" />
          </div>
          <span className="mt-0.5 text-xs">Groups</span>
        </Link>

        {/* Personal */}
        <Link
          to="/personal-expenses"
          id="mobile-nav-personal"
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
            isPersonalActive
              ? "text-violet-600 font-semibold"
              : "text-slate-500 hover:text-slate-700 font-medium"
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-full px-4 py-1 transition-colors duration-200 ${
              isPersonalActive ? "bg-violet-100 text-violet-600" : "text-slate-500"
            }`}
          >
            <FaCreditCard className="text-lg" />
          </div>
          <span className="mt-0.5 text-xs">Personal</span>
        </Link>
      </div>
    </nav>
  );
}

export default BottomNav;
