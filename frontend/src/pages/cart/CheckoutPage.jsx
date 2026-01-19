import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../api/orderApi';
import {
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Shield,
  ChevronRight,
  Lock
} from 'lucide-react';

const CheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart, cartItems, fetchCart, clearCart, clearCartImmediate } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      setOrderItems(cartItems);
    } else {
      if (location.state?.guestProducts) {
        setOrderItems(location.state.guestProducts);
      } else if (cartItems.length > 0) {
        setOrderItems(cartItems);
      } else {
        setOrderItems([]);
      }
    }
  }, [isAuthenticated, cartItems, location.state]);

  const subtotal = orderItems.reduce((total, item) => {
    const price = parseFloat(item.product.sale_price || item.product.regular_price);
    return total + price * item.quantity;
  }, 0);

  const shippingCost = subtotal > 500 ? 0 : 60;
  const totalPrice = subtotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (orderItems.length === 0) {
      setError('No items to order. Please add items to cart first.');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!street.trim() || !city.trim()) {
      setError('Street address and city are required');
      return;
    }

    const fullAddress = `${street}, ${city}${postalCode ? `, ${postalCode}` : ''}`;
    let orderData;

    setLoading(true);

    try {
      if (isAuthenticated) {
        orderData = {
          cartId: cart?.id,
          fullAddress,
          phone,
          paymentMethod: "Cash on Delivery",
        };
      } else {
        const items = orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));

        orderData = {
          cartId: cart?.id,
          items: items,
          fullAddress,
          phone,
          paymentMethod: "Cash on Delivery",
          guestDetails: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined
          },
        };
      }

      console.log('Placing order with data:', orderData);
      const apiResponse = await placeOrder(orderData);

      // ✅ Cart Clearing Logic (Simplified & Robust)
      try {
        // 1. Immediately clear UI state
        clearCartImmediate();

        // 2. Sync with backend (fire and forget)
        // We use the new API-based clearCart from context
        clearCart().catch(e => console.warn('Background clear cart failed', e));

      } catch (e) {
        console.warn('Frontend clear cart error:', e);
      }

      navigate('/order-success', {
        state: {
          order: apiResponse.data,
          isGuest: !isAuthenticated,
          orderItems: orderItems,
          totalAmount: totalPrice,
          cartCleared: true
        }
      });

    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  // ✅ FIXED: Improved cart clearing with better error handling
  const clearCartAndProceed = async (apiResponse) => {
    if (!isAuthenticated) {
      return true; // No cart to clear for guests
    }

    try {
      console.log('Attempting to clear cart...');
      await clearCart();
      console.log('Cart cleared successfully');

      // Refresh cart data in context
      setTimeout(() => {
        fetchCart();
      }, 500);

      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Don't block order success if cart clearing fails
      return false;
    }
  };

  // Empty Cart State
  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 text-lg">
            {isAuthenticated
              ? 'Add some amazing products to your cart to get started!'
              : 'Browse our products or use "Order Now" from any product page.'
            }
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Checkout</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <ShoppingBag size={20} />
            <span>Secure Checkout</span>
            <ChevronRight size={16} />
            <span className="text-blue-600 font-semibold">Almost there!</span>
          </div>
        </div>

        {/* User Type Badge */}
        <div className="mb-8">
          {isAuthenticated ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Welcome back, {user?.name}!</p>
                <p className="text-blue-700">You're ordering as a registered customer</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">Guest Checkout</p>
                <p className="text-green-700">No account needed - Quick and easy!</p>
              </div>
              <button
                onClick={() => navigate('/login', { state: { from: location } })}
                className="bg-white text-green-700 font-semibold px-6 py-2 rounded-full hover:bg-green-100 transition-colors border border-green-200"
              >
                Login Instead
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

              {/* Personal Information Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  Personal Information
                </h2>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <User size={18} className="text-blue-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Mail size={18} className="text-blue-600" />
                        Email {!isAuthenticated && <span className="text-gray-400 text-sm">(Optional)</span>}
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Phone size={18} className="text-blue-600" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+880 1XXX-XXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  Shipping Address
                </h2>

                <div className="space-y-5">
                  {/* Street Address */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-purple-600" />
                      Street Address *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      placeholder="House no, Road, Area"
                    />
                  </div>

                  {/* City & Postal Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        placeholder="City name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Postal Code <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="1200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 p-3 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Cash on Delivery</p>
                    <p className="text-green-700">Pay when you receive your order</p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                  />
                  <span className="text-gray-700 group-hover:text-gray-900 transition">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline font-semibold">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline font-semibold">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 px-8 rounded-2xl transition-all transform shadow-lg flex items-center justify-center gap-3 text-lg ${loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <Lock size={22} />
                    Place Order - {totalPrice.toFixed(2)} BDT
                  </>
                )}
              </button>

              {/* Guest Login Prompt */}
              {!isAuthenticated && (
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                      onClick={() => navigate('/login', { state: { from: location } })}
                    >
                      Login here
                    </button>{' '}
                    for faster checkout
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Package className="w-7 h-7 text-blue-600" />
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition">
                    <img
                      src={item.product.images?.[0]?.url || 'https://placehold.co/80x80?text=No+Image'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/80x80?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {parseFloat(item.product.sale_price || item.product.regular_price).toFixed(2)} BDT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {(parseFloat(item.product.sale_price || item.product.regular_price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">BDT</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} BDT</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'FREE' : `${shippingCost.toFixed(2)} BDT`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 Add {(500 - subtotal).toFixed(2)} BDT more for free shipping!
                    </p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">BDT</p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;