// src/components/layout/Header.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../api/authApi";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, Home, Package, Truck } from "lucide-react";

// Import separate components
import DesktopSearch from "./DesktopSearch";
import MobileSearch from "./MobileSearch";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
      } catch (error) {
        console.log("Error fetching user profile in Header");
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      
      if (mobileMenuOpen && mobileMenuRef.current && 
          !mobileMenuRef.current.contains(e.target) && 
          !e.target.closest('button[aria-label="mobile menu"]')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Handlers
  const handleSearchOpen = () => {
    setSearchOpen(true);
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(prev => !prev);
    setSearchOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavigation = (callback) => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-blue-600 flex items-center"
          onClick={() => handleNavigation()}
        >
          🛍️ DeshShera
        </Link>

        {/* Desktop Search */}
        <DesktopSearch 
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
        />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="hover:text-blue-600 transition font-semibold"
            onClick={() => handleNavigation()}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="hover:text-blue-600 transition font-semibold"
            onClick={() => handleNavigation()}
          >
            Products
          </Link>
          <Link 
            to="/track-order"
            className="hover:text-blue-600 transition font-semibold"
            onClick={() => handleNavigation()}
          >
            Track Order
          </Link>
         
          {/* Cart */}
          <Link 
            to="/cart"
            className="relative hover:text-blue-600 transition font-semibold flex items-center gap-1"
            onClick={() => handleNavigation()}
          >
            <ShoppingCart size={20} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {isAuthenticated ? (
            <UserMenu 
              userMenuOpen={userMenuOpen}
              setUserMenuOpen={setUserMenuOpen}
              userMenuRef={userMenuRef}
              profile={profile}
              user={user}
              logout={logout}
              navigate={navigate}
              handleNavigation={handleNavigation}
            />
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="hover:text-blue-600 transition font-semibold"
                onClick={() => handleNavigation()}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition font-semibold"
                onClick={() => handleNavigation()}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={handleSearchOpen}
            className="p-2 hover:text-blue-600 transition"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <Link 
            to="/cart" 
            className="relative p-2 hover:text-blue-600 transition"
            onClick={() => handleNavigation()}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={handleMobileMenuToggle}
            className="p-2 focus:outline-none hover:text-blue-600 transition"
            aria-label="mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      <MobileSearch 
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
      />

      {/* Mobile Menu */}
      <MobileMenu 
        mobileMenuOpen={mobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
        closeMobileMenu={closeMobileMenu}
        isAuthenticated={isAuthenticated}
        profile={profile}
        user={user}
        logout={logout}
        navigate={navigate}
        handleNavigation={handleNavigation}
      />
    </header>
  );
};

export default Header;