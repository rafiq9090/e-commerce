// src/components/layout/MobileMenu.jsx
import { Link } from "react-router-dom";
import { X, Home, Package, Truck, User } from "lucide-react";

const MobileMenu = ({
  mobileMenuOpen,
  mobileMenuRef,
  closeMobileMenu,
  isAuthenticated,
  profile,
  user,
  logout,
  navigate,
  handleNavigation
}) => {
  if (!mobileMenuOpen) return null;

  return (
    <>
      <div 
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeMobileMenu}
      />
      
      <div 
        ref={mobileMenuRef}
        className="md:hidden fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white z-50 shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={closeMobileMenu}
            className="p-2 hover:bg-blue-700 rounded-full transition"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {profile?.profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">
                  {profile?.profile?.name || user?.email?.split('@')[0] || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100%-140px)]">
          <Link
            to="/"
            onClick={() => handleNavigation()}
            className="flex items-center gap-3 py-3 px-4 hover:bg-blue-50 rounded-lg transition font-semibold text-gray-700"
          >
            <Home size={20} className="text-blue-600" />
            <span>Home</span>
          </Link>

          <Link
            to="/products"
            onClick={() => handleNavigation()}
            className="flex items-center gap-3 py-3 px-4 hover:bg-blue-50 rounded-lg transition font-semibold text-gray-700"
          >
            <Package size={20} className="text-blue-600" />
            <span>Products</span>
          </Link>

          <Link
            to="/track-order"
            onClick={() => handleNavigation()}
            className="flex items-center gap-3 py-3 px-4 hover:bg-blue-50 rounded-lg transition font-semibold text-gray-700"
          >
            <Truck size={20} className="text-blue-600" />
            <span>Track Order</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => handleNavigation()}
                className="flex items-center gap-3 py-3 px-4 hover:bg-blue-50 rounded-lg transition font-semibold text-gray-700"
              >
                <User size={20} className="text-blue-600" />
                <span>My Profile</span>
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={() => {
                  handleNavigation(() => {
                    logout();
                    navigate("/");
                  });
                }}
                className="flex items-center gap-3 py-3 px-4 text-left hover:bg-red-50 rounded-lg transition font-semibold text-red-600 mt-2"
              >
                <X size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 my-2"></div>

              <Link
                to="/login"
                onClick={() => handleNavigation()}
                className="flex items-center gap-3 py-3 px-4 hover:bg-blue-50 rounded-lg transition font-semibold text-gray-700"
              >
                <User size={20} className="text-blue-600" />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                onClick={() => handleNavigation()}
                className="flex items-center gap-3 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold justify-center mt-2"
              >
                <User size={20} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">DeshShera © 2024</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;