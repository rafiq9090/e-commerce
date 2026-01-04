import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminProtectedRoute from './AdminProtectedRoute';
import NotFound from '../pages/NotFound';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage'; 
import CheckoutPage from '../pages/CheckoutPage';
import ThankYouPage from '../pages/ThankYouPage';
import TrackOrderPage from '../pages/TrackOrderPage'; 
import ProfilePage from '../pages/ProfilePage';

import ProductsPage from '../pages/ProductsPage';
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<ThankYouPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/products" element={<ProductsPage />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;