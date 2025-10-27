import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Shield, 
  ArrowRight,
  AlertCircle,
  Loader2,
  Package,
  CheckCircle,
  Tag,
  Lock,
  ChevronRight
} from 'lucide-react';

const CartPage = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  // Calculate prices
  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.product.sale_price || item.product.regular_price) || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);

  const shippingCost = subtotal > 500 ? 0 : 60;
  const totalPrice = subtotal + shippingCost;

  // Handle quantity update
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItem(null);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (itemId, productName) => {
    setItemToDelete({ id: itemId, name: productName });
    setShowDeleteDialog(true);
  };

  // Handle remove
  const handleRemoveFromCart = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await removeFromCart(itemToDelete.id);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Close dialog
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  // Safe price formatting
  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-semibold">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900">Shopping Cart</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Package size={18} />
                <span className="font-semibold">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                <ChevronRight size={16} />
                <span>Ready to checkout</span>
              </div>
            </div>
          </div>
        </div>

        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scaleIn">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Remove Item?</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-8 text-lg">
                Are you sure you want to remove <span className="font-bold text-gray-900">"{itemToDelete?.name}"</span> from your cart?
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={closeDeleteDialog}
                  disabled={deleting}
                  className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveFromCart}
                  disabled={deleting}
                  className="flex-1 px-6 py-4 text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="text-gray-400" size={64} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
              Looks like you haven't added any items to your cart yet. Start shopping to find amazing products!
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingBag size={24} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => {
                const itemPrice = parseFloat(item.product.sale_price || item.product.regular_price) || 0;
                const isOutOfStock = item.product.inventory?.quantity <= 0;
                const maxQuantity = Math.min(item.product.inventory?.quantity || 10, 10);
                const hasDiscount = item.product.sale_price && item.product.sale_price < item.product.regular_price;

                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-6">
                     
                      <Link 
                        to={`/product/${item.product.slug}`}
                        className="flex-shrink-0 group"
                      >
                        <div className="relative">
                          <img 
                            src={item.product.images?.[0]?.url || 'https://placehold.co/140x140?text=No+Image'} 
                            alt={item.product.name} 
                            className="w-32 h-32 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                          />
                          {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                              SALE
                            </div>
                          )}
                        </div>
                      </Link>
                   
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <Link 
                            to={`/product/${item.product.slug}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition line-clamp-2 flex-1 pr-4"
                          >
                            {item.product.name}
                          </Link>
                      
                          <button 
                            onClick={() => showDeleteConfirmation(item.id, item.product.name)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition p-2 rounded-xl"
                            title="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        
                      
                        <div className="mb-4">
                          {hasDiscount ? (
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-black text-gray-900">
                                {formatPrice(itemPrice)} BDT
                              </p>
                              <p className="text-lg text-gray-500 line-through">
                                {formatPrice(item.product.regular_price)} BDT
                              </p>
                            </div>
                          ) : (
                            <p className="text-2xl font-black text-gray-900">
                              {formatPrice(itemPrice)} BDT
                            </p>
                          )}
                        </div>
                        
                    
                        {isOutOfStock ? (
                          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl mb-4 inline-flex border border-red-200">
                            <AlertCircle size={18} />
                            <span className="text-sm font-bold">Out of Stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl mb-4 inline-flex border border-green-200">
                            <CheckCircle size={18} />
                            <span className="text-sm font-bold">In Stock</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isOutOfStock || updatingItem === item.id}
                              className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                              {updatingItem === item.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Minus size={20} />
                              )}
                            </button>
                            <span className="w-12 text-center font-black text-2xl text-gray-900">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isOutOfStock || updatingItem === item.id || item.quantity >= maxQuantity}
                              className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                              {updatingItem === item.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Plus size={20} />
                              )}
                            </button>
                          </div>
              
                          <div className="text-right">
                            <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              {formatPrice(itemPrice * item.quantity)} BDT
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500 font-medium">
                                {item.quantity} × {formatPrice(itemPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

     
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-blue-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal ({cartCount} items)</span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)} BDT</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingCost === 0 ? 'FREE' : `${formatPrice(shippingCost)} BDT`}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-sm text-blue-700 font-medium">
                        💡 Add {formatPrice(500 - subtotal)} BDT more for free shipping!
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border-t-2 border-gray-200 my-6"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-black text-gray-900">Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatPrice(totalPrice)}
                    </p>
                    <p className="text-sm text-gray-500">BDT</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Truck size={16} className="text-white" />
                    </div>
                    <span className="font-medium">Free delivery on orders over 500 BDT</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Shield size={16} className="text-white" />
                    </div>
                    <span className="font-medium">Secure payment & buyer protection</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <span className="font-medium">Quality guaranteed products</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-bold text-green-900">Guest Checkout Available</p>
                    </div>
                    <p className="text-sm text-green-700">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold underline hover:text-green-900">
                        Login here
                      </Link>{' '}
                      for faster checkout.
                    </p>
                  </div>
                )}

                <Link
                  to="/checkout"
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-black text-lg text-center mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Lock size={20} />
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </Link>

              
                <Link
                  to="/products"
                  className="block w-full text-center text-gray-700 bg-gray-100 py-4 rounded-2xl hover:bg-gray-200 transition-all font-bold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;