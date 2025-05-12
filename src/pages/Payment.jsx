import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { MdDeleteForever } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa";
import paymentBg from "../assets/payment.webp";
import cartIcon from "../assets/cart.png";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Add font preload
const fontPreload = () => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
};

// PayPal configuration
const initialOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
  components: "buttons",
  "enable-funding": "card",
  "disable-funding": "paylater,venmo",
  "data-sdk-integration-source": "button-factory",
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { cartItems, clearCart, updateCartItemQuantity, removeFromCart } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState("direct_card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [localItems, setLocalItems] = useState(
    location.state?.cart || cartItems
  );
  const [orderTotal, setOrderTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Preload fonts on component mount
  useEffect(() => {
    fontPreload();
  }, []);

  // Update localItems when cartItems changes
  useEffect(() => {
    if (cartItems) {
      setLocalItems(cartItems);
    }
  }, [cartItems]);

  // Update totals whenever localItems changes
  useEffect(() => {
    const total = localItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    const tax = total * 0.3;
    setOrderTotal(total);
    setTaxAmount(tax);
    setFinalTotal(total + tax);
  }, [localItems]);

  // Get cart items from location state or context
  const items = localItems;
  const username =
    currentUser?.displayName?.split(" ")[0] ||
    currentUser?.email?.split("@")[0] ||
    "User";

  // If no items in cart and no items in location state, redirect to home
  useEffect(() => {
    if (!localItems || localItems.length === 0) {
      navigate("/");
    }
  }, [localItems, navigate]);

  const handleQuantityChange = (itemId, change) => {
    const item = localItems.find((item) => item.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, (item.quantity || 1) + change);
    updateCartItemQuantity(itemId, newQuantity);

    // Update local items
    setLocalItems((prevItems) =>
      prevItems.map((i) =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your order?"
      )
    ) {
      // First update local state
      const updatedItems = localItems.filter((item) => item.id !== itemId);
      setLocalItems(updatedItems);

      // Then update cart context
      removeFromCart(itemId);

      // If no items left, redirect to home
      if (updatedItems.length === 0) {
        navigate("/");
      }
    }
  };

  const handleDirectCardPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Here you would integrate with your payment processor
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearCart();
      alert("Payment successful!");
      navigate("/");
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSuccess = (data, actions) => {
    return actions.order.capture().then(function (details) {
      clearCart();
      alert("Payment completed by " + details.payer.name.given_name);
      navigate("/");
    });
  };

  const handlePayPalError = (err) => {
    setPaypalError(err);
    alert("PayPal payment failed. Please try again.");
    console.error("PayPal Error:", err);
  };

  const createPayPalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: (finalTotal + finalTotal * 0.3).toFixed(2),
          },
        },
      ],
    });
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans antialiased">
      {/* Background with enhanced gradient */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `url(${paymentBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(135deg, #060B11 0%, #1A1A1A 50%, #2C1810 100%)",
          opacity: 0.95,
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col overflow-x-hidden">
        {/* Top Navigation */}
        <div className="bg-[#121A22]/40 backdrop-blur-lg border-b border-[#EEAD22]/10 p-4 w-full">
          <div className="w-full flex justify-end items-center space-x-2 sm:space-x-4 px-2 sm:px-4">
            <Link
              to="/package"
              className="relative inline-flex items-center justify-center px-4 sm:px-8 py-2 sm:py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-[#EEAD22]/20 hover:bg-[#121A22]/60 hover:shadow-[#EEAD22]/20 text-sm sm:text-base"
            >
              <span className="mr-2">🎮</span>
              Packages
            </Link>
            <Link
              to="/wallet"
              className="relative inline-flex items-center justify-center px-4 sm:px-8 py-2 sm:py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-[#EEAD22]/20 hover:bg-[#121A22]/60 hover:shadow-[#EEAD22]/20 text-sm sm:text-base"
            >
              <span className="mr-2">💰</span>
              Wallet
            </Link>
            <div className="relative group">
              <button className="flex items-center space-x-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#EEAD22]/20"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EEAD22] flex items-center justify-center text-white font-bold">
                    {currentUser?.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#121A22]/90 rounded-lg shadow-lg border border-[#EEAD22]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 text-white">
                    {currentUser?.displayName}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="max-w-7xl mx-auto p-4 sm:p-8 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F9D94D] mb-6 sm:mb-8 text-center">
            Order Summary
          </h1>

          {/* Order Items */}
          <div className="space-y-6 flex flex-col items-center justify-center w-full">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex w-[95%] items-center justify-center sm:w-[600px] md:w-[600px] mx-auto relative"
              >
                {/* Main Order Box */}
                <div
                  className="w-full h-auto rounded-lg p-4 sm:p-6 relative"
                  style={{
                    background:
                      "linear-gradient(152.13deg, #060A0E -19.62%, #577166 36.86%, #192531 93.34%, #577166 124.85%)",
                    boxShadow: "0px 13px 19px 0px #00000026",
                  }}
                >
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4 md:-right-6 md:-top-4 transition-all duration-300 z-10 hover:scale-110"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-sm"></div>
                      <MdDeleteForever className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-red-500 hover:text-red-400 transition-colors duration-300" />
                    </div>
                  </button>

                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="text-white text-[11px]">
                          Order Status:
                        </span>
                        <span className="text-[#60FC65] bg-[#468CD24D] w-[50px] h-[18px] rounded-full text-[10px] text-center flex items-center justify-center ml-2">
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-[11px]">
                          {username}
                        </span>
                        {currentUser?.photoURL && (
                          <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="w-5 h-5 rounded-full border border-[#EEAD22]/20"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-white text-[11px] bg-[#121A22]/40 p-1.5 rounded-lg whitespace-nowrap">
                        {item.crystals} 💎
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            item.quantity <= 1
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-[#4E4E4E] hover:bg-[#5E5E5E]"
                          }`}
                          style={{ boxShadow: "0px 7px 13px 0px #FF99004F" }}
                        >
                          <FaMinus className="text-white w-2.5 h-2.5" />
                        </button>
                        <span className="text-white text-[11px] min-w-[1.5rem] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-[#4E4E4E] hover:bg-[#5E5E5E] text-white flex items-center justify-center transition-all duration-300"
                          style={{ boxShadow: "0px 7px 13px 0px #FF99004F" }}
                        >
                          <FaPlus className="text-white w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 bg-[#121A22]/40 p-1.5 rounded-lg">
                        <span className="text-white text-[11px] whitespace-nowrap">
                          Price:
                        </span>
                        <span className="text-[#EEAD22] text-[11px] font-semibold">
                          ${item.price}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-[#121A22]/40 p-1.5 rounded-lg">
                        <span className="text-white text-[11px] whitespace-nowrap">
                          Cash Back:
                        </span>
                        <span className="text-[#60FC65] text-[11px] font-semibold">
                          ${(item.price * 0.05).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/Tablet Grid Layout */}
                  <div className="hidden sm:grid grid-cols-3 gap-4">
                    {/* First Row */}
                    <div className="flex items-center">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="text-white text-[11px] sm:text-base">
                          Order Status:
                        </span>
                        <span className="text-[#60FC65] bg-[#468CD24D] w-[60px] h-[20px] md:w-[80px] md:h-[25px] rounded-full text-[11px] sm:text-base text-center flex items-center justify-center ml-3">
                          Pending
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center pl-14">
                      <div className="flex items-center space-x-3">
                        <span className="text-white text-[11px] sm:text-base whitespace-nowrap">
                          {username}
                        </span>
                        {currentUser?.photoURL && (
                          <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#EEAD22]/20"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center pl-16">
                      <div className="text-white text-[11px] sm:text-base bg-[#121A22]/40 p-2 rounded-lg whitespace-nowrap">
                        {item.crystals} 💎
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="flex items-center">
                      <div className="flex items-center space-x-3 bg-[#121A22]/40 p-2 rounded-lg">
                        <span className="text-white text-[11px] sm:text-base whitespace-nowrap">
                          Price:
                        </span>
                        <span className="text-[#EEAD22] text-[11px] sm:text-base font-semibold">
                          ${item.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center pl-10">
                      <div className="flex items-center space-x-3 bg-[#121A22]/40 p-2 rounded-lg">
                        <span className="text-white text-[11px] sm:text-base whitespace-nowrap">
                          Cash Back:
                        </span>
                        <span className="text-[#60FC65] text-[11px] sm:text-base font-semibold">
                          ${(item.price * 0.05).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center pl-14">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            item.quantity <= 1
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-[#4E4E4E] hover:bg-[#5E5E5E]"
                          }`}
                          style={{ boxShadow: "0px 7px 13px 0px #FF99004F" }}
                        >
                          <FaMinus className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="text-white text-[11px] sm:text-base min-w-[2rem] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#4E4E4E] hover:bg-[#5E5E5E] text-white flex items-center justify-center transition-all duration-300"
                          style={{ boxShadow: "0px 7px 13px 0px #FF99004F" }}
                        >
                          <FaPlus className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 sm:mt-8 max-w-md mx-auto px-4 sm:px-0">
            <div className="flex justify-between text-white py-3 border-b border-[#F9D94D]/20 text-sm sm:text-base">
              <span>Orders Price:</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white py-3 border-b border-[#F9D94D]/20 text-sm sm:text-base">
              <span>Taxes:</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#F9D94D] font-bold text-lg sm:text-xl py-3">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="mt-8 sm:mt-12 max-w-2xl mx-auto px-4 sm:px-0">
            <div className="bg-[#07080A]/40 backdrop-blur-lg border border-[#F9D94D]/20 rounded-lg p-4 sm:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F9D94D] mb-4 sm:mb-6 text-center">
                Payment Details
              </h2>
              <form
                onSubmit={handleDirectCardPayment}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <label className="block text-white mb-2 text-base sm:text-lg font-medium">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setShowPayPalButtons(e.target.value === "paypal");
                    }}
                    className="w-full bg-[#302F3C]/80 backdrop-blur-sm text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#F9D94D] border border-[#F9D94D]/20 transition-all duration-300 text-sm sm:text-base"
                  >
                    <option value="direct_card">Direct Card Payment</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {paymentMethod === "direct_card" ? (
                  <>
                    <div>
                      <label className="block text-white mb-2 text-base sm:text-lg font-medium">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-[#302F3C]/80 backdrop-blur-sm text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#F9D94D] border border-[#F9D94D]/20 transition-all duration-300 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-white mb-2 text-base sm:text-lg font-medium">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-[#302F3C]/80 backdrop-blur-sm text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#F9D94D] border border-[#F9D94D]/20 transition-all duration-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 text-base sm:text-lg font-medium">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          className="w-full bg-[#302F3C]/80 backdrop-blur-sm text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#F9D94D] border border-[#F9D94D]/20 transition-all duration-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full bg-[#F9D94D] text-[#07080A] font-bold py-3 sm:py-4 rounded-lg transition-all duration-300 text-base sm:text-lg ${
                        isProcessing
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#F9D94D]/80 hover:shadow-lg hover:shadow-[#F9D94D]/20"
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Pay Now"}
                    </button>
                  </>
                ) : (
                  <div className="mt-4">
                    {paypalError ? (
                      <div className="text-red-500 text-center mb-4">
                        Failed to load PayPal. Please try again or use direct
                        card payment.
                      </div>
                    ) : (
                      <PayPalScriptProvider options={initialOptions}>
                        <PayPalButtons
                          style={{
                            layout: "vertical",
                            color: "gold",
                            shape: "rect",
                            label: "pay",
                          }}
                          createOrder={createPayPalOrder}
                          onApprove={handlePayPalSuccess}
                          onError={handlePayPalError}
                          forceReRender={[paymentMethod]}
                        />
                      </PayPalScriptProvider>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
