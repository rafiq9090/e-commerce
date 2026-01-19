import { useState } from 'react';
import { trackOrder } from '../../api/orderApi';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null); // Clear previous results
    
    try {
      const response = await trackOrder(orderId, identifier);
      setOrder(response.data);
    } catch (err) {
      setError(err.message || 'Order not found. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Track Your Order</h1>
      
      {/* --- Tracking Form --- */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderId">
            Order ID
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order ID"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
            Your Email or Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="The email or phone you used to order"
            required
          />
        </div>
        
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>

      {/* --- Order Details Display --- */}
      {order && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Order Status</h2>
          <div className="mb-2">
            <strong>Order ID:</strong> {order.id}
          </div>
          <div className="mb-2">
            <strong>Status:</strong> 
            <span className="font-semibold text-blue-600 ml-2">{order.status}</span>
          </div>
          <div className="mb-2">
            <strong>Customer:</strong> {order.customerName}
          </div>
          <div className="mb-4">
            <strong>Total:</strong> {parseFloat(order.totalAmount).toFixed(2)} BDT
          </div>
          
          <h3 className="text-lg font-semibold border-t pt-4">Items</h3>
          <ul className="list-disc list-inside mt-2 mb-4">
            {order.orderItems.map((item) => (
              <li key={item.id}>
                {item.productName} (Qty: {item.quantity})
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold border-t pt-4">Tracking History</h3>
          <div className="mt-2 space-y-2">
            {order.history.map((entry) => (
              <div key={entry.id} className="text-sm">
                <span className="font-semibold text-gray-800">{formatDate(entry.createdAt)}:</span>
                <span className="ml-2 text-gray-600">{entry.comment || `Status updated to ${entry.status}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
