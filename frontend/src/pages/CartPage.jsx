import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  // 1. Get the new functions
  const { cartItems, cartCount, removeFromCart, updateQuantity } = useCart();

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.sale_price || item.regular_price;
    return total + price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link></p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center bg-white shadow-md rounded-lg p-4">
                <img 
                  src={item.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">{item.sale_price || item.regular_price} BDT</p>
                  {/* 2. Add Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                {/* 3. Add Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="bg-gray-200 px-2 rounded"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="bg-gray-200 px-2 rounded"
                  >
                    +
                  </button>
                </div>
                
                <div className="text-right w-24 ml-4">
                  <p className="font-semibold">
                    {(item.sale_price || item.regular_price) * item.quantity} BDT
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ... (Order Summary remains the same) ... */}
          <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit sticky top-24">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal ({cartCount} items)</span>
              <span>{totalPrice.toFixed(2)} BDT</span>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{totalPrice.toFixed(2)} BDT</span>
            </div>
            <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Proceed to Checkout
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartPage;