import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import paymentBg from "../assets/payment.webp";
import cartIcon from "../assets/cart.png";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { cartItems, clearCart, updateCartItemQuantity } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get cart items from location state or context
  const items = location.state?.cart || cartItems;
  const username =
    currentUser?.displayName?.split(" ")[0] ||
    currentUser?.email?.split("@")[0] ||
    "User";

  // If no items in cart and no items in location state, redirect to home
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/");
    }
  }, [items, navigate]);

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  };

  const handleQuantityChange = (itemId, change) => {
    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, (item.quantity || 1) + change);
    updateCartItemQuantity(itemId, newQuantity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Here you would typically integrate with a payment processor
      // For now, we'll just simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear the cart after successful payment
      clearCart();

      // Show success message and redirect
      alert("Payment successful!");
      navigate("/");
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
                className="flex w-[95%] items-center justify-center sm:w-[640px] mx-auto"
              >
                {/* Main Order Box */}
                <div
                  className="w-[75%] sm:w-[446.73px] h-[104px] rounded-l-lg p-4"
                  style={{
                    background:
                      "linear-gradient(152.13deg, #060A0E -19.62%, #577166 36.86%, #192531 93.34%)",
                    boxShadow: "0px 13px 19px 0px #00000026",
                    marginLeft: "-24px",
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm sm:text-base">
                        Order Status: Pending
                      </span>
                      <span className="text-white text-sm sm:text-base">
                        {username}
                      </span>
                      {currentUser?.photoURL && (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-white text-sm sm:text-base">
                      ${item.price}
                    </div>
                    <div className="text-[#60FC65] text-sm sm:text-base">
                      Cash Back: ${(item.price * 0.05).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity Box */}
                <div
                  className="w-[25%] sm:w-[193.62px] h-[104px] rounded-lg p-4 flex flex-col items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(147.43deg, rgba(255, 255, 255, 0.48) 5.2%, rgba(0, 0, 0, 0.48) 65.03%, rgba(255, 255, 255, 0.48) 124.85%)",
                    border: "1px solid",
                    borderImageSource:
                      "linear-gradient(180deg, rgba(238, 255, 0, 0) 10.51%, rgba(0, 0, 0, 0) 58.55%)",
                    boxShadow: "0px 13px 19px 0px #00000026",
                    transform: "rotate(-180deg)",
                  }}
                >
                  <div className="text-white mb-2 transform rotate-180 text-sm sm:text-base">
                    {item.crystals} 💎
                  </div>
                  <div className="flex items-center space-x-2 transform rotate-180">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#4E4E4E] text-white flex items-center justify-center text-sm sm:text-base"
                      style={{ boxShadow: "0px 7px 13px 0px #FF99004F" }}
                    >
                      -
                    </button>
                    <span className="text-white text-sm sm:text-base">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#4E4E4E] text-white flex items-center justify-center text-sm sm:text-base"
                      style={{ boxShadow: "0px 7px 13px 0px #FF99004F" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 sm:mt-8 max-w-md mx-auto px-4 sm:px-0">
            <div className="flex justify-between text-white py-3 border-b border-[#F9D94D]/20 text-sm sm:text-base">
              <span>Orders Price:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white py-3 border-b border-[#F9D94D]/20 text-sm sm:text-base">
              <span>Taxes:</span>
              <span>${(calculateTotal() * 0.3).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#F9D94D] font-bold text-lg sm:text-xl py-3">
              <span>Total:</span>
              <span>
                ${(calculateTotal() + calculateTotal() * 0.3).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="mt-8 sm:mt-12 max-w-2xl mx-auto px-4 sm:px-0">
            <div className="bg-[#07080A]/40 backdrop-blur-lg border border-[#F9D94D]/20 rounded-lg p-4 sm:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F9D94D] mb-4 sm:mb-6 text-center">
                Payment Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-white mb-2 text-base sm:text-lg font-medium">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#302F3C]/80 backdrop-blur-sm text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#F9D94D] border border-[#F9D94D]/20 transition-all duration-300 text-sm sm:text-base"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                  </select>
                </div>

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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
