import { useState } from 'react';
import { trackOrderPublic } from '../api/orderApi';
import { 
  Package, 
  Search, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Truck,
  Mail,
  Phone,
  AlertCircle,
  Calendar,
  User,
  ShoppingBag,
  Award,
  XCircle
} from 'lucide-react';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    
    try {
      const response = await trackOrderPublic(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Order not found. Please check your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  // Status configurations
  const getStatusConfig = (status) => {
    const configs = {
      'DELIVERED': { 
        color: 'text-green-600', 
        bgColor: 'bg-green-50', 
        borderColor: 'border-green-200',
        icon: CheckCircle,
        gradientFrom: 'from-green-500',
        gradientTo: 'to-emerald-600'
      },
      'SHIPPED': { 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200',
        icon: Truck,
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-indigo-600'
      },
      'PROCESSING': { 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50', 
        borderColor: 'border-yellow-200',
        icon: Clock,
        gradientFrom: 'from-yellow-500',
        gradientTo: 'to-orange-600'
      },
      'PENDING': { 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-50', 
        borderColor: 'border-gray-200',
        icon: Package,
        gradientFrom: 'from-gray-500',
        gradientTo: 'to-gray-600'
      },
      'CANCELLED': { 
        color: 'text-red-600', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200',
        icon: XCircle,
        gradientFrom: 'from-red-500',
        gradientTo: 'to-pink-600'
      }
    };
    return configs[status] || configs['PENDING'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-lg">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-lg text-gray-600">Enter your Order ID to check delivery status</p>
        </div>
        
        {/* Tracking Form */}
        <div className="bg-white shadow-2xl rounded-3xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-3 flex items-center gap-2" htmlFor="orderId">
                <Search className="w-5 h-5 text-blue-600" />
                Order ID *
              </label>
              <input
                className="w-full py-4 px-6 border-2 border-gray-200 rounded-2xl text-gray-700 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                id="orderId"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., 12345)"
                required
                disabled={loading}
              />
              <p className="text-gray-500 text-sm mt-2 ml-1">
                💡 You received this ID in your order confirmation email
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            <button
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 px-8 rounded-2xl transition-all transform shadow-lg flex items-center justify-center gap-3 text-lg ${
                loading || !orderId.trim()
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl'
              }`}
              type="submit"
              disabled={loading || !orderId.trim()}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Tracking Order...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Track My Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details Display */}
        {order && (
          <div className="space-y-6">
            
            {/* Status Header Card */}
            <div className={`${getStatusConfig(order.status).bgColor} border-2 ${getStatusConfig(order.status).borderColor} rounded-3xl p-8 shadow-lg`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`bg-gradient-to-r ${getStatusConfig(order.status).gradientFrom} ${getStatusConfig(order.status).gradientTo} p-4 rounded-2xl shadow-lg`}>
                    {(() => {
                      const StatusIcon = getStatusConfig(order.status).icon;
                      return <StatusIcon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Order ID: #{order.id}</p>
                    <h2 className={`text-3xl font-black ${getStatusConfig(order.status).color}`}>
                      {order.status}
                    </h2>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-gray-600 text-sm font-semibold mb-1">Order Total</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {parseFloat(order.totalAmount).toFixed(2)} BDT
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Information */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  Customer Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Name</p>
                      <p className="text-gray-900 font-semibold">{order.customerName}</p>
                    </div>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Phone</p>
                        <p className="text-gray-900 font-semibold">{order.customerPhone}</p>
                      </div>
                    </div>
                  )}
                  {order.customerEmail && (
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-50 p-2 rounded-lg">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Email</p>
                        <p className="text-gray-900 font-semibold break-all">{order.customerEmail}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Order Date</p>
                      <p className="text-gray-900 font-semibold">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                  Payment Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                      <p className="text-2xl font-black text-gray-900">{parseFloat(order.totalAmount).toFixed(2)} BDT</p>
                    </div>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Discount Applied</p>
                        <p className="text-lg font-bold text-green-600">-{parseFloat(order.discountAmount).toFixed(2)} BDT</p>
                      </div>
                    </div>
                  )}
                  {order.payment && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-50 p-2 rounded-lg">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Payment Method</p>
                          <p className="text-gray-900 font-semibold capitalize">{order.payment.paymentMethod.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`${
                          order.payment.status === 'SUCCESS' ? 'bg-green-50' : 
                          order.payment.status === 'FAILED' ? 'bg-red-50' : 'bg-yellow-50'
                        } p-2 rounded-lg`}>
                          <CheckCircle className={`w-5 h-5 ${
                            order.payment.status === 'SUCCESS' ? 'text-green-600' : 
                            order.payment.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Payment Status</p>
                          <p className={`font-semibold capitalize ${
                            order.payment.status === 'SUCCESS' ? 'text-green-600' : 
                            order.payment.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {order.payment.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.address && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  Shipping Address
                </h3>
                <div className="flex items-start gap-4 bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-200">
                  <div className="bg-purple-600 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-lg mb-1">{order.address.fullAddress}</p>
                    {order.address.city && (
                      <p className="text-gray-600">
                        {order.address.city}, {order.address.state} {order.address.postalCode}
                      </p>
                    )}
                    {order.address.country && (
                      <p className="text-gray-600">{order.address.country}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                Order Items ({order.orderItems.length})
              </h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-blue-600 p-3 rounded-xl">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × {parseFloat(item.unitPrice).toFixed(2)} BDT
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900">
                        {parseFloat(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">BDT</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            {order.history && order.history.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  Order Timeline
                </h3>
                <div className="space-y-6">
                  {order.history.map((history, index) => {
                    const StatusIcon = getStatusConfig(history.status).icon;
                    return (
                      <div key={history.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`${
                            index === 0 
                              ? `bg-gradient-to-r ${getStatusConfig(history.status).gradientFrom} ${getStatusConfig(history.status).gradientTo}` 
                              : 'bg-gray-200'
                          } p-3 rounded-xl shadow-lg`}>
                            <StatusIcon className={`w-5 h-5 ${index === 0 ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          {index < order.history.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <p className={`font-black text-lg capitalize ${getStatusConfig(history.status).color}`}>
                                {history.status.toLowerCase()}
                              </p>
                              <p className="text-sm text-gray-500 font-medium">{formatDate(history.createdAt)}</p>
                            </div>
                            {history.comment && (
                              <p className="text-gray-600">{history.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        {!order && !loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 text-center shadow-lg">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Can't find your Order ID? Check your email confirmation or contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:support@deshshera.com"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-full hover:bg-blue-100 transition-all shadow-md border-2 border-blue-200"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </a>
              <a 
                href="tel:+8801234567890"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-md"
              >
                <Phone className="w-5 h-5" />
                Call Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;