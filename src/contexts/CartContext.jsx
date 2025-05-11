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
    const savedCart = localStorage.getItem(`cart_${currentUser?.uid || "guest"}`);
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
    const savedCart = localStorage.getItem(`cart_${currentUser?.uid || "guest"}`);
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

  const updateQuantity = (itemId, change) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, (item.quantity || 1) + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(`cart_${currentUser?.uid || "guest"}`);
  };

  const handleBuyNow = (item) => {
    if (cartItems.length > 0) {
      setPendingItem(item);
      setShowCheckoutModal(true);
    } else {
      addToCart(item);
    }
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
    updateQuantity,
    clearCart,
    handleBuyNow,
    showCheckoutModal,
    setShowCheckoutModal,
    handleCheckout,
    handleContinueShopping,
    handleAddAndCheckout,
    handleCartClick,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#07080A] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-[#F9D94D] text-xl font-bold mb-4">
              {cartItems.length > 0 ? "Your cart is not empty" : "Shopping Cart"}
            </h3>
            <p className="text-white mb-6">
              {cartItems.length > 0
                ? "Would you like to:"
                : "Your cart is empty"}
            </p>
            <div className={cartItems.length > 0 ? "flex flex-col space-y-3" : "flex justify-center"}>
              {cartItems.length > 0 ? (
                <>
                  {pendingItem && (
                    <>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-[#302F3C] text-white py-2 rounded-lg hover:bg-[#302F3C]/80"
                      >
                        Clear Cart & Checkout with Selected Package
                      </button>
                      <button
                        onClick={handleContinueShopping}
                        className="w-full bg-[#F9D94D] text-[#07080A] py-2 rounded-lg hover:bg-[#F9D94D]/80"
                      >
                        Add to Cart & Continue Shopping
                      </button>
                      <button
                        onClick={handleAddAndCheckout}
                        className="w-full bg-[#302F3C] text-white py-2 rounded-lg hover:bg-[#302F3C]/80"
                      >
                        Add to Cart & Proceed to Checkout
                      </button>
                      <button
                        onClick={() => {
                          setShowCheckoutModal(false);
                          setPendingItem(null);
                        }}
                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {!pendingItem && (
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="w-full bg-[#F9D94D] text-[#07080A] py-2 rounded-lg hover:bg-[#F9D94D]/80"
                    >
                      Close
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="bg-[#F9D94D] text-[#07080A] px-8 py-2 rounded-lg hover:bg-[#F9D94D]/80"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
