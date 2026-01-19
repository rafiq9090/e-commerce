import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderDetails } from '../../api/orderApi';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderDetails(id);
        setOrder(res.data || res);
      } catch (err) {
        setError(err.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="animate-pulse h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">{error || 'Order not found.'}</p>
            <Link to="/profile" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">Back to Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = Number(order.totalAmount || 0).toFixed(2);

  const statusStyle = {
    PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
    PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
    SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    REFUNDED: 'bg-slate-100 text-slate-700 border-slate-200',
  }[order.status] || 'bg-gray-100 text-gray-700 border-gray-200';

  const handlePrintInvoice = () => {
    const items = order.orderItems || [];
    const rows = items.map((item) => {
      const name = item.product?.name || item.productName || 'Item';
      const qty = item.quantity || 0;
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      const lineTotal = (unitPrice * qty).toFixed(2);
      return `
        <tr>
          <td>${name}</td>
          <td>${qty}</td>
          <td>${unitPrice.toFixed(2)}</td>
          <td>${lineTotal}</td>
        </tr>
      `;
    }).join('');

    const shippingAddress = order.address?.fullAddress || order.fullAddress || 'N/A';
    const paymentMethod = order.payment?.paymentMethod || order.paymentMethod || 'Cash on Delivery';
    const total = Number(order.totalAmount || 0).toFixed(2);

    const html = `
      <html>
        <head>
          <title>Invoice #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 4px; }
            .meta { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0 24px; }
            .card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            th { background: #f9fafb; }
            .total { text-align: right; font-weight: 700; margin-top: 16px; }
          </style>
        </head>
        <body>
          <h1>Invoice #${order.id}</h1>
          <div class="meta">Placed on ${new Date(order.createdAt).toLocaleString()}</div>
          <div class="grid">
            <div class="card">
              <strong>Customer</strong>
              <div>${order.customerName || 'N/A'}</div>
              <div>${order.customerEmail || 'N/A'}</div>
              <div>${order.customerPhone || 'N/A'}</div>
            </div>
            <div class="card">
              <strong>Shipping Address</strong>
              <div>${shippingAddress}</div>
              <div style="margin-top:8px"><strong>Payment</strong>: ${paymentMethod}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="total">Total: ${total} BDT</div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto p-6 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>{order.status}</span>
              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Print Invoice
            </button>
            <Link to="/profile" className="text-blue-600 hover:text-blue-700 font-semibold">Back to Account</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
            <p className="text-gray-600 text-sm">{order.address?.fullAddress || order.shippingAddress || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
            <p className="text-gray-600 text-sm">{order.payment?.paymentMethod || order.paymentMethod || 'Cash on Delivery'}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Total</h3>
            <p className="text-2xl font-bold text-gray-900">{totalAmount} BDT</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Items</h2>
          </div>
          <div className="divide-y">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                <div className="flex items-center gap-4">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt="" className="w-16 h-16 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border"></div>
                  )}
                  <div>
                    <Link to={`/product/${item.product?.slug || ''}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {item.product?.name || item.productName}
                    </Link>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{Number(item.unitPrice || 0).toFixed(2)} BDT</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
