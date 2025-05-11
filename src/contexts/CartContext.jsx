import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    // Load cart items from localStorage on initial render
    const savedCart = localStorage.getItem(
      `cart_${currentUser?.uid || "guest"}`
    );
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      `cart_${currentUser?.uid || "guest"}`,
      JSON.stringify(cartItems)
    );
  }, [cartItems, currentUser]);

  // Load cart items when user changes
  useEffect(() => {
    const savedCart = localStorage.getItem(
      `cart_${currentUser?.uid || "guest"}`
    );
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(`cart_${currentUser?.uid || "guest"}`);
  };

  const handleBuyNow = (item) => {
    setPendingItem(item);
    setShowCheckoutModal(true);
  };

  const handleCartClick = () => {
    setShowCheckoutModal(true);
  };

  const handleCheckout = () => {
    if (pendingItem) {
      clearCart();
      addToCart(pendingItem);
    }
    setShowCheckoutModal(false);
    setPendingItem(null);
  };

  const handleContinueShopping = () => {
    if (pendingItem) {
      addToCart(pendingItem);
    }
    setShowCheckoutModal(false);
    setPendingItem(null);
  };

  const handleAddAndCheckout = () => {
    if (pendingItem) {
      addToCart(pendingItem);
      // Navigate to payment page
      window.location.href = "/payment";
    }
    setShowCheckoutModal(false);
    setPendingItem(null);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    handleBuyNow,
    showCheckoutModal,
    setShowCheckoutModal,
    handleCheckout,
    handleContinueShopping,
    handleAddAndCheckout,
    handleCartClick,
    pendingItem,
    setPendingItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
