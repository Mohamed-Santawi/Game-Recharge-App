import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { MdDeleteForever } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa";
import paymentBg from "../assets/payment.webp";
import visa from "../assets/visa.png";
import mastercard from "../assets/master.png";
import paypal from "../assets/paypal.png";

import cartIcon from "../assets/cart.png";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      "::placeholder": {
        color: "#aab7c4",
      },
      backgroundColor: "#302F3C",
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

// Stripe Payment Form Component
const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("initial"); // 'initial', 'processing', 'success', 'error'
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPaymentStatus("processing");
    setPaymentMessage("Processing your payment...");

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

      if (error) {
        setError(error.message);
        setPaymentStatus("error");
        setPaymentMessage(error.message);
        onError(error);
      } else {
        onSuccess(paymentMethod);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setPaymentStatus("error");
      setPaymentMessage("An unexpected error occurred.");
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#302F3C]/80 backdrop-blur-sm rounded-lg p-4">
        <CardElement options={cardElementOptions} />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full bg-[#F9D94D] text-[#07080A] font-bold py-3 sm:py-4 rounded-lg transition-all duration-300 text-base sm:text-lg ${
          !stripe || isProcessing
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[#F9D94D]/80 hover:shadow-lg hover:shadow-[#F9D94D]/20"
        }`}
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

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
};

// Card Payment Form Component
const CardPaymentForm = ({ amount, onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("initial");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);
    setPaymentStatus("processing");
    setPaymentMessage("Processing your payment...");

    try {
      console.log("Starting payment process...");
      console.log("Card details:", {
        number: cardNumber.replace(/\s/g, ""),
        expiry: expiryDate,
        cvv: cvv,
      });

      // Create PayPal order with card details
      const response = await fetch(
        "http://localhost:5000/api/create-paypal-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount,
            cardDetails: {
              number: cardNumber.replace(/\s/g, ""),
              expiry: expiryDate,
              cvv: cvv,
            },
          }),
        }
      );

      const orderData = await response.json();
      console.log("PayPal order created:", orderData);

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      setPaymentMessage("Order created. Capturing payment...");

      // Capture the payment
      console.log("Capturing payment for order:", orderData.orderId);
      const captureResponse = await fetch(
        "http://localhost:5000/api/capture-paypal-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
          }),
        }
      );

      const captureData = await captureResponse.json();
      console.log("Payment capture response:", captureData);

      if (!captureResponse.ok) {
        throw new Error(captureData.error || "Failed to capture payment");
      }

      if (captureData.status === "COMPLETED") {
        setPaymentStatus("success");
        setPaymentMessage(
          `Payment successful! $${captureData.amount} has been withdrawn from your account. Transaction ID: ${captureData.paymentId}`
        );
        onSuccess(captureData);
      } else {
        throw new Error(`Payment failed with status: ${captureData.status}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
      setPaymentStatus("error");
      setPaymentMessage(err.message);
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#302F3C]/80 backdrop-blur-sm rounded-lg p-4">
        <div className="space-y-4">
          {/* Card Number Input */}
          <div>
            <label className="block text-white text-sm mb-2">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className="w-full bg-[#302F3C] text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-[#F9D94D] focus:outline-none"
              required
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(formatExpiryDate(e.target.value))
                }
                placeholder="MM/YY"
                maxLength="5"
                className="w-full bg-[#302F3C] text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-[#F9D94D] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
                }
                placeholder="123"
                maxLength="3"
                className="w-full bg-[#302F3C] text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-[#F9D94D] focus:outline-none"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className={`w-full bg-[#F9D94D] text-[#07080A] font-bold py-3 sm:py-4 rounded-lg transition-all duration-300 text-base sm:text-lg ${
          isProcessing
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[#F9D94D]/80 hover:shadow-lg hover:shadow-[#F9D94D]/20"
        }`}
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>

      {paymentStatus !== "initial" && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            paymentStatus === "success"
              ? "bg-green-500/20 border border-green-500/50"
              : paymentStatus === "error"
              ? "bg-red-500/20 border border-red-500/50"
              : "bg-yellow-500/20 border border-yellow-500/50"
          }`}
        >
          <p
            className={`text-center ${
              paymentStatus === "success"
                ? "text-green-400"
                : paymentStatus === "error"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {paymentMessage}
          </p>
        </div>
      )}
    </div>
  );
};

// PayPal Buttons Component
const PayPalButtonsComponent = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        }}
        createOrder={async () => {
          const response = await fetch(
            "http://localhost:5000/api/create-paypal-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount: amount,
              }),
            }
          );
          const orderData = await response.json();
          return orderData.orderId;
        }}
        onApprove={async (data, actions) => {
          const response = await fetch(
            "http://localhost:5000/api/capture-paypal-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderID,
              }),
            }
          );
          const captureData = await response.json();
          if (response.ok) {
            onSuccess(captureData);
          } else {
            onError(new Error(captureData.error));
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
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
  const [paymentStatus, setPaymentStatus] = useState("initial"); // 'initial', 'processing', 'success', 'error'
  const [paymentMessage, setPaymentMessage] = useState("");

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

  const handleStripeSuccess = async (paymentMethod) => {
    try {
      setIsProcessing(true);
      setPaymentStatus("processing");
      setPaymentMessage("Confirming payment with your bank...");

      // Create payment intent on the backend
      const response = await fetch(
        "http://localhost:5000/api/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalTotal,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const data = await response.json();

      // Confirm the payment with the payment method
      const { error: confirmError, paymentIntent } =
        await stripePromise.confirmCardPayment(data.clientSecret, {
          payment_method: paymentMethod.id,
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === "succeeded") {
        setPaymentStatus("success");
        setPaymentMessage(
          "Payment successful! Your bank has confirmed the transaction."
        );
        clearCart();

        // Show success message for 3 seconds before redirecting
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setPaymentMessage(
        `Payment failed: ${error.message || "An unexpected error occurred"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeError = (error) => {
    console.error("Stripe error:", error);
    alert("Payment failed: " + error.message);
  };

  const handlePayPalSuccess = async (data, actions) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/capture-paypal-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: data.orderID,
          }),
        }
      );

      const captureData = await response.json();

      if (!response.ok) {
        throw new Error(
          captureData.error || "Failed to capture PayPal payment"
        );
      }

      clearCart();
      alert("Payment completed successfully!");
      navigate("/");
    } catch (error) {
      console.error("PayPal capture error:", error);
      alert("Payment failed: " + error.message);
    }
  };

  const handlePayPalError = (err) => {
    setPaypalError(err);
    alert("PayPal payment failed. Please try again.");
    console.error("PayPal Error:", err);
  };

  const createPayPalOrder = async (data, actions) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/create-paypal-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalTotal,
          }),
        }
      );

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create PayPal order");
      }

      return orderData.orderId;
    } catch (error) {
      console.error("PayPal order creation error:", error);
      throw error;
    }
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
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-white mb-4 text-base sm:text-lg font-medium">
                    Payment Method
                  </label>
                  <div className="flex gap-4">
                    {/* Debit Card Box */}
                    <div
                      onClick={() => {
                        setPaymentMethod("direct_card");
                        setShowPayPalButtons(false);
                      }}
                      className={`w-[200px] h-[80px] rounded-[20px] p-4 cursor-pointer transition-all duration-300 ${
                        paymentMethod === "direct_card"
                          ? "bg-[#302F3C] border-2 border-[#F9D94D]"
                          : "bg-[#302F3C]/80 hover:bg-[#302F3C]"
                      }`}
                    >
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <img
                          src={mastercard}
                          alt="Mastercard"
                          className="h-6"
                        />
                        <img src={visa} alt="Visa" className="h-6" />
                      </div>
                      <div className="text-center text-[#F9D94D] font-medium">
                        Debit Card
                      </div>
                    </div>

                    {/* PayPal Box */}
                    <div
                      onClick={() => {
                        setPaymentMethod("paypal");
                        setShowPayPalButtons(true);
                      }}
                      className={`w-[177px] h-[80px] rounded-[20px] p-4 cursor-pointer transition-all duration-300 ${
                        paymentMethod === "paypal"
                          ? "bg-white border-2 border-[#F9D94D]"
                          : "bg-white/80 hover:bg-white"
                      }`}
                    >
                      <div className="flex justify-center items-center mb-2">
                        <img src={paypal} alt="PayPal" className="h-8" />
                      </div>
                      <div className="flex justify-center">
                        <span className="text-[#003087] font-semibold text-sm">
                          PayPal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === "direct_card" ? (
                  <CardPaymentForm
                    amount={finalTotal}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                  />
                ) : (
                  <div className="mt-4">
                    {paypalError ? (
                      <div className="text-red-500 text-center mb-4">
                        Failed to load PayPal. Please try again or use direct
                        card payment.
                      </div>
                    ) : (
                      <PayPalButtonsComponent
                        amount={finalTotal}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
