// FIXED CartContext.jsx - With proper clearCart implementation
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, removeCartItem, updateCartItem, clearCart as clearCartApi } from '../api/cartApi';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async (retryCount = 0) => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getCart(); 
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error.message);
      
      if (retryCount < 2) {
        console.log(`Retrying cart fetch... (${retryCount + 1}/2)`);
        setTimeout(() => fetchCart(retryCount + 1), 1000);
        return;
      }
      
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    
    const loadCart = async () => {
      if (isMounted) {
        await fetchCart();
      }
    };

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, fetchCart]);

  const optimisticUpdate = (updater) => {
    const previousCart = cart;
    setCart(updater(previousCart));
    return previousCart;
  };

  const handleAddToCart = async (productId, quantity) => {
    setOperationLoading(true);
    
    const previousCart = optimisticUpdate(currentCart => {
      if (!currentCart) return currentCart;
      
      const existingItem = currentCart.items.find(item => item.productId === productId);
      
      if (existingItem) {
        return {
          ...currentCart,
          items: currentCart.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        const tempItem = {
          id: `temp-${Date.now()}`,
          productId,
          quantity,
          product: { id: productId, name: 'Loading...' },
          createdAt: new Date().toISOString()
        };
        
        return {
          ...currentCart,
          items: [...currentCart.items, tempItem]
        };
      }
    });

    try {
      const response = await addToCart(productId, quantity);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to add to cart:", error.message);
      setCart(previousCart);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    setOperationLoading(true);
    
    const previousCart = optimisticUpdate(currentCart => {
      if (!currentCart) return currentCart;
      return {
        ...currentCart,
        items: currentCart.items.filter(item => item.id !== cartItemId)
      };
    });

    try {
      const response = await removeCartItem(cartItemId);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to remove from cart:", error.message);
      setCart(previousCart);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return handleRemoveFromCart(cartItemId);
    }

    setOperationLoading(true);
    
    const previousCart = optimisticUpdate(currentCart => {
      if (!currentCart) return currentCart;
      return {
        ...currentCart,
        items: currentCart.items.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      };
    });

    try {
      const response = await updateCartItem(cartItemId, newQuantity);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to update quantity:", error.message);
      setCart(previousCart);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  // ✅ FIXED: Proper clearCart implementation
  const clearCart = async () => {
    if (!isAuthenticated || !cart || cart.items.length === 0) {
      // If no cart or empty, just reset state
      setCart(null);
      return { success: true, message: 'Cart already empty' };
    }

    setOperationLoading(true);
    
    const previousCart = cart;
    
    try {
      try {
        await clearCartApi();
        console.log('Cart cleared successfully via API');
      } catch (apiError) {
        console.log('Clear cart API not available, using fallback method:', apiError.message);
        
        const removePromises = cart.items.map(item => 
          removeCartItem(item.id).catch(err => {
            console.warn(`Failed to remove item ${item.id}:`, err.message);
            return null;
          })
        );
        
        await Promise.all(removePromises);
        console.log('Cart cleared using fallback method');
      }
      
      await fetchCart();
      
      return { success: true, message: 'Cart cleared successfully' };
      
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setCart(previousCart);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const clearCartImmediate = () => {
    setCart(null);
    return { success: true, message: 'Cart cleared immediately' };
  };

  const cartItems = cart ? cart.items : [];
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cartItems.reduce((total, item) => {
    const price = parseFloat(item.product.sale_price || item.product.regular_price);
    return total + (price * item.quantity);
  }, 0);

  const value = {
    cart,
    cartItems,
    cartCount,
    totalPrice: totalPrice.toFixed(2),
    loading,
    operationLoading,
    fetchCart,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart,
    clearCartImmediate, 
    isEmpty: cartItems.length === 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};