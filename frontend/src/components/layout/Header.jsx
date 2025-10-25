import { useAuth } from '../../context/AuthContext'; 
import { useCart } from '../../context/CartContext'; // 1. Import useCart
import { Link } from 'react-router-dom'; // 2. Import Link

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth(); 
  const { cartCount } = useCart(); // 3. Get the cart count

  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        {/* 4. Use Link for navigation */}
        <Link to="/" className="text-2xl font-bold text-blue-600">DeshShera</Link>
        <div>
          <Link to="/cart" className="ml-4 relative">
            Cart 
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <>
              <span className="ml-4">Hi, {user?.profile?.name || 'User'}</span> 
              <button onClick={logout} className="ml-4">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="ml-4">Login</Link>
              <Link to="/register" className="ml-4">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;