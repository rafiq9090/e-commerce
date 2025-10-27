// src/components/layout/UserMenu.jsx
import { Link } from "react-router-dom";
import { X, User } from "lucide-react";

const UserMenu = ({
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  profile,
  user,
  logout,
  navigate,
  handleNavigation
}) => {
  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen((prev) => !prev)}
        className="flex items-center space-x-2 focus:outline-none hover:text-blue-600 transition"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {profile?.profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </div>
        <span className="font-semibold">
          {profile?.profile?.name || user?.email?.split('@')[0] || "User"}
        </span>
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-semibold text-gray-900 truncate">
              {profile?.profile?.name || "User"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 transition font-semibold text-gray-700"
            onClick={() => setUserMenuOpen(false)}
          >
            <User size={16} />
            My Profile
          </Link>
          
          <button
            onClick={() => {
              logout();
              navigate("/");
              setUserMenuOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 transition font-semibold text-red-600"
          >
            <X size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;