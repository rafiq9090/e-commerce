import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AdminProtectedRoute from './AdminProtectedRoute';

const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

// Lazy Load Pages
const HomePage = lazyWithPreload(() => import('../pages/misc/HomePage'));
const LoginPage = lazyWithPreload(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazyWithPreload(() => import('../pages/auth/RegisterPage'));
const ProductDetailPage = lazyWithPreload(() => import('../pages/products/ProductDetailPage'));
const CartPage = lazyWithPreload(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazyWithPreload(() => import('../pages/cart/CheckoutPage'));
const ThankYouPage = lazyWithPreload(() => import('../pages/cart/ThankYouPage'));
const TrackOrderPage = lazyWithPreload(() => import('../pages/misc/TrackOrderPage'));
const ProfilePage = lazyWithPreload(() => import('../pages/account/ProfilePage'));
const ProductsPage = lazyWithPreload(() => import('../pages/products/ProductsPage'));
const ProductLandingPage = lazyWithPreload(() => import('../pages/products/ProductLandingPage'));
const AdminLogin = lazyWithPreload(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazyWithPreload(() => import('../pages/admin/AdminDashboard'));
const PolicyPage = lazyWithPreload(() => import('../pages/misc/PolicyPage'));
const ContactPage = lazyWithPreload(() => import('../pages/misc/ContactPage'));
const NotFound = lazyWithPreload(() => import('../pages/misc/NotFound'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppRoutes = () => {
  useEffect(() => {
    const prefetch = () => {
      ProductsPage.preload();
      CartPage.preload();
      CheckoutPage.preload();
      TrackOrderPage.preload();
      PolicyPage.preload();
      ContactPage.preload();
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 1500);
    }
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route
            path="/about"
            element={(
              <PolicyPage
                titleKey="about_us_title"
                bodyKey="about_us_body"
                defaultTitle="About Us"
                defaultBody={`DeshShera is built for shoppers who want quality and value. We curate products from trusted suppliers and deliver fast across Bangladesh.\n\nOur mission is to make everyday shopping effortless with transparent pricing, reliable delivery, and friendly support.`}
              />
            )}
          />
          <Route
            path="/deals"
            element={(
              <PolicyPage
                titleKey="todays_deals_title"
                bodyKey="todays_deals_body"
                defaultTitle="Today's Deals"
                defaultBody={`Discover limited-time discounts across electronics, fashion, and home essentials.\n\nCheck back daily for new deals and flash sales curated just for you.`}
              />
            )}
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/shipping"
            element={(
              <PolicyPage
                titleKey="shipping_policy_title"
                bodyKey="shipping_policy_body"
                defaultTitle="Shipping Policy"
                defaultBody={`We process orders within 1-2 business days.\n\nStandard delivery takes 2-5 business days depending on your location. Express options may be available at checkout.\n\nShipping fees are calculated at checkout based on weight, destination, and service level.\n\nYou will receive a tracking number by email once your order ships.`}
              />
            )}
          />
          <Route
            path="/returns"
            element={(
              <PolicyPage
                titleKey="return_refund_title"
                bodyKey="return_refund_body"
                defaultTitle="Return & Refund Policy"
                defaultBody={`We accept returns within 7 days of delivery for unused items in original packaging.\n\nTo request a return, contact support with your order number and reason for return.\n\nRefunds are issued to the original payment method within 5-10 business days after inspection.\n\nShipping fees are non-refundable unless the item arrived damaged or incorrect.`}
              />
            )}
          />
          <Route
            path="/privacy"
            element={(
              <PolicyPage
                titleKey="privacy_policy_title"
                bodyKey="privacy_policy_body"
                defaultTitle="Privacy Policy"
                defaultBody={`We respect your privacy and only collect information needed to process your orders and improve your shopping experience.\n\nWe never sell your personal data to third parties.\n\nWe use cookies to remember your preferences and optimize site performance.\n\nYou can request access to or deletion of your data by contacting support.`}
              />
            )}
          />
          <Route
            path="/terms"
            element={(
              <PolicyPage
                titleKey="terms_conditions_title"
                bodyKey="terms_conditions_body"
                defaultTitle="Terms & Conditions"
                defaultBody={`By using this site, you agree to our terms and conditions.\n\nPrices and availability are subject to change without notice.\n\nWe reserve the right to cancel orders for suspected fraud or misuse.\n\nAny disputes will be handled according to local laws and regulations.`}
              />
            )}
          />
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Landing Pages exist outside MainLayout for focus */}
        <Route path="/landing/:slug" element={<ProductLandingPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
