import { createContext, useState, useContext, useEffect } from 'react';
import { logoutUser } from '../api/authApi'; // 1. Import logoutUser

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  // 2. Update the logout function
  const logout = async () => {
    try {
      await logoutUser(); // Call the backend logout
    } catch (error) {
      console.error("Logout failed:", error.message);
    } finally {
      // 3. Clear frontend state
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};