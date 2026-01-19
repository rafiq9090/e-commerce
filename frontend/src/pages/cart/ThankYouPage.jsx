// pages/OrderSuccessPage.js
import { useLocation, Link } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
});

// Modern PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '1 solid #e53e3e',
  },
  companyInfo: {
    flex: 2,
  },
  invoiceInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  successSection: {
    backgroundColor: '#f0fff4',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    border: '1 solid #9ae6b4',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#276749',
    marginBottom: 5,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 5,
    border: '1 solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1 solid #e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  infoValue: {
    flex: 1,
    color: '#2d3748',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e53e3e',
    padding: 8,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableColProduct: {
    flex: 3,
    fontSize: 9,
  },
  tableCol: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
  },
  totalsSection: {
    backgroundColor: '#f7fafc',
    padding: 15,
    borderRadius: 5,
    border: '1 solid #e2e8f0',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '2 solid #e53e3e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notesSection: {
    backgroundColor: '#fffaf0',
    padding: 12,
    borderRadius: 5,
    border: '1 solid #fed7aa',
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dd6b20',
    marginBottom: 6,
  },
  noteItem: {
    fontSize: 8,
    color: '#744210',
    marginBottom: 3,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTop: '1 solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#718096',
    marginBottom: 3,
  },
  thankYou: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
});

// PDF Document Component - Single Page
const InvoicePDF = ({ order, orderItems, totalAmount, isGuest }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>DESHSHERA</Text>
            <Text style={styles.tagline}>Your Trusted Shopping Partner</Text>
            <Text style={styles.tagline}>Dhaka, Bangladesh</Text>
            <Text style={styles.tagline}>Phone: +880 XXXX-XXXXXX</Text>
            <Text style={styles.tagline}>Email: support@deshshera.com</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>Date: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.invoiceNumber}>Invoice #: {order.id || order.orderId}</Text>
            <Text style={styles.invoiceNumber}>Status: CONFIRMED</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successSection}>
          <Text style={styles.successText}>✓ ORDER PLACED SUCCESSFULLY!</Text>
          <Text style={{ fontSize: 9, color: '#276749' }}>Thank you for your purchase</Text>
        </View>

        {/* Order and Shipping Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>ORDER INFORMATION</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>{order.id || order.orderId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment:</Text>
              <Text style={styles.infoValue}>{order.paymentMethod || 'Cash on Delivery'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: '#276749' }]}>Confirmed</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>SHIPPING INFORMATION</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{order.guestDetails?.name || order.customerName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{order.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{order.guestDetails?.email || order.customerEmail || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{order.shippingAddress || order.fullAddress}</Text>
            </View>
          </View>
        </View>

        {/* Order Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>PRODUCT NAME</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>PRICE</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>QTY</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.3 }]}>TOTAL</Text>
          </View>
          
          {orderItems?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableColProduct}>{item.product.name}</Text>
              <Text style={styles.tableCol}>
                {parseFloat(item.product.sale_price || item.product.regular_price).toFixed(2)}
              </Text>
              <Text style={styles.tableCol}>{item.quantity}</Text>
              <Text style={styles.tableCol}>
                {((item.product.sale_price || item.product.regular_price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{totalAmount?.toFixed(2) || '0.00'} BDT</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Shipping:</Text>
            <Text style={{ color: '#276749' }}>FREE</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax:</Text>
            <Text>0.00 BDT</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>GRAND TOTAL:</Text>
            <Text>{totalAmount?.toFixed(2) || '0.00'} BDT</Text>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>IMPORTANT NOTES</Text>
          <Text style={styles.noteItem}>• Please keep this invoice for your records</Text>
          <Text style={styles.noteItem}>• For any queries, contact our customer support</Text>
          <Text style={styles.noteItem}>• Expected delivery: 3-5 business days</Text>
          <Text style={styles.noteItem}>• Cash on Delivery orders must be paid upon receipt</Text>
          {isGuest && (
            <Text style={styles.noteItem}>• You ordered as guest. Save Order ID: {order.id || order.orderId}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>Thank you for shopping with DeshShera!</Text>
          <Text style={styles.footerText}>Quality Products • Best Prices • Fast Delivery</Text>
          <Text style={styles.footerText}>www.deshshera.com • support@deshshera.com • +880 XXXX-XXXXXX</Text>
        </View>
      </View>
    </Page>
  </Document>
);

const ThankYouPage = () => {
  const location = useLocation();
  const { order, isGuest, orderItems, totalAmount } = location.state || {};

  if (!order) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center">
        <h1 className="text-3xl font-bold mb-6">Order Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find your order details.</p>
        <Link to="/" className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Invoice Action */}
      <div className="flex justify-end mb-6">
        <PDFDownloadLink
          document={<InvoicePDF order={order} orderItems={orderItems} totalAmount={totalAmount} isGuest={isGuest} />}
          fileName={`invoice-${order.id || order.orderId}.pdf`}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
        >
          {({ loading }) => (
            loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice PDF
              </span>
            )
          )}
        </PDFDownloadLink>
      </div>

      {/* Order Details Display */}
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">Thank you for your purchase</p>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Order ID:</span>
                <span className="text-gray-900">{order.id || order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Order Date:</span>
                <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-green-600 font-bold">{totalAmount?.toFixed(2) || '0.00'} BDT</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Payment Method:</span>
                <span className="text-gray-900">{order.paymentMethod || 'Cash on Delivery'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Status:</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Shipping Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Customer:</span>
                <span className="text-gray-900">{order.guestDetails?.name || order.customerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="text-gray-900">{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-900">{order.guestDetails?.email || order.customerEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Address:</span>
                <p className="text-gray-900 mt-1">{order.shippingAddress || order.fullAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Order Summary</h3>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 font-bold">
              <div>Product</div>
              <div className="text-right">Price</div>
              <div className="text-right">Quantity</div>
              <div className="text-right">Total</div>
            </div>
            {orderItems?.map((item, index) => (
              <div key={index} className="grid grid-cols-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <img
                    src={item.product.images?.[0]?.url || 'https://placehold.co/50x50?text=No+Image'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg mr-4 shadow-sm"
                  />
                  <span className="font-medium text-gray-800">{item.product.name}</span>
                </div>
                <div className="text-right self-center">
                  <span className="text-gray-700">{parseFloat(item.product.sale_price || item.product.regular_price).toFixed(2)} BDT</span>
                </div>
                <div className="text-right self-center">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                    {item.quantity}
                  </span>
                </div>
                <div className="text-right self-center">
                  <span className="font-semibold text-gray-900">
                    {((item.product.sale_price || item.product.regular_price) * item.quantity).toFixed(2)} BDT
                  </span>
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                <span>Grand Total</span>
                <span className="text-red-600">{totalAmount?.toFixed(2) || '0.00'} BDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Message */}
        {isGuest ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="text-lg font-semibold text-yellow-800">Guest Order Notice</h4>
            </div>
            <p className="text-yellow-700">
              You ordered as a guest. Please save your Order ID for tracking purposes.
            </p>
            <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
              <span className="font-mono font-bold text-yellow-900 text-lg">{order.id || order.orderId}</span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h4 className="text-lg font-semibold text-blue-800">Order Tracking</h4>
            </div>
            <p className="text-blue-700 mt-2">
              You can track your order status from your account dashboard. We'll also send you email updates.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link
          to="/products"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          Continue Shopping
        </Link>
        
        {isGuest ? (
          <Link
            to="/track-order"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-center font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Track Your Order
          </Link>
        ) : (
          <Link
            to="/profile"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-center font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            View Orders
          </Link>
        )}
      </div>
    </div>
  );
};

export default ThankYouPage;
