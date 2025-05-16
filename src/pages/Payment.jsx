import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { MdDeleteForever } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa";
import paymentBg from "../assets/payment.webp";
import paypal from "../assets/paypal.png";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// PayPal configuration
const initialOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
  components: "buttons,card-fields",
  "enable-funding": "card",
  "disable-funding": "paylater,venmo",
  "data-sdk-integration-source": "button-factory",
  vault: false,
  "data-namespace": "PayPalSDK",
  "data-client-token": "",
  "data-page-type": "checkout",
  "data-merchant-id": "",
  "data-partner-attribution-id": "",
  "data-csp-nonce": "",
  "data-currency": "USD",
  "data-intent": "capture",
  "data-commit": "true",
  "data-vault": "false",
  "data-disable-funding": "paylater,venmo",
  "data-enable-funding": "card",
  "data-components": "buttons,card-fields",
  "data-sdk-integration-source": "button-factory",
  "data-sdk-client-token": "",
  "data-sdk-partner-attribution-id": "",
  "data-sdk-merchant-id": "",
  "data-sdk-currency": "USD",
  "data-sdk-intent": "capture",
  "data-sdk-commit": "true",
  "data-sdk-vault": "false",
  "data-sdk-disable-funding": "paylater,venmo",
  "data-sdk-enable-funding": "card",
  "data-sdk-components": "buttons,card-fields",
  "data-sdk-sdk-integration-source": "button-factory",
};

// PayPal Buttons Component
const PayPalButtonsComponent = ({ amount, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Format amount to exactly 2 decimal places
  const formatAmount = (value) => {
    return Number(value).toFixed(2);
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setLoadError(
        new Error(
          "PayPal client ID is not configured. Please check your environment variables."
        )
      );
      setIsLoading(false);
      return;
    }

    setLoadError(null);
    setIsLoading(true);

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,card-fields&enable-funding=card&disable-funding=paylater,venmo&vault=false&commit=true`;
    script.async = true;
    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      setLoadError(new Error("Failed to load PayPal. Please try again later."));
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="text-red-500 text-center mb-4">{loadError.message}</div>
    );
  }

  return (
    <div className="min-h-[150px] w-full flex items-center justify-center">
      {isLoading && (
        <div className="text-white text-center text-sm sm:text-base">
          Loading PayPal...
        </div>
      )}
      {!isLoading && !loadError && (
        <PayPalScriptProvider options={initialOptions}>
          <div className="w-full">
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "black",
                shape: "rect",
                label: "pay",
                height: window.innerWidth < 640 ? 35 : 45,
                tagline: false,
                width: "100%",
              }}
              className="w-full"
              fundingSource="card"
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: formatAmount(amount),
                        currency_code: "USD",
                      },
                    },
                  ],
                  application_context: {
                    shipping_preference: "NO_SHIPPING",
                    user_action: "PAY_NOW",
                    brand_name: "Game Recharge Store",
                    locale: "en-US",
                    landing_page: "NO_PREFERENCE",
                    return_url: window.location.origin,
                    cancel_url: window.location.origin,
                  },
                });
              }}
              onApprove={async (data, actions) => {
                try {
                  const order = await actions.order.capture();
                  onSuccess(order);
                } catch (error) {
                  onError(error);
                }
              }}
              onError={(err) => {
                setLoadError(err);
                onError(err);
              }}
              onCancel={() => {
                // Silently handle cancellation without showing error
                return;
              }}
            />
          </div>
        </PayPalScriptProvider>
      )}
    </div>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { cartItems, clearCart, updateCartItemQuantity, removeFromCart } =
    useCart();
  const [isPayPalLoading, setIsPayPalLoading] = useState(true);
  const [paypalError, setPaypalError] = useState(null);
  const [localItems, setLocalItems] = useState(
    location.state?.cart || cartItems
  );
  const [orderTotal, setOrderTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("initial");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [showPayPalButtons, setShowPayPalButtons] = useState(false);

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

  const handlePayPalSuccess = async () => {
    try {
      setPaymentStatus("success");
      setPaymentMessage("Payment successful! Your order has been processed.");
      clearCart();

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setPaymentStatus("error");
      setPaymentMessage("Failed to process payment. Please try again.");
    }
  };

  const handlePayPalError = (err) => {
    // Only show error if it's not a cancellation
    if (err.message !== "Payment cancelled by user") {
      setPaymentStatus("error");
      setPaymentMessage(err.message || "Payment failed. Please try again.");
      setPaypalError(err);
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EEAD22] flex items-center justify-center text-white font-bold">
                  {currentUser?.displayName?.charAt(0).toUpperCase()}
                </div>
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
                        <div className="w-5 h-5 rounded-full bg-[#EEAD22] flex items-center justify-center text-white text-xs font-bold">
                          {currentUser?.displayName?.charAt(0).toUpperCase()}
                        </div>
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
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#EEAD22] flex items-center justify-center text-white font-bold">
                          {currentUser?.displayName?.charAt(0).toUpperCase()}
                        </div>
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
                <div className="flex justify-center">
                  <div
                    onClick={() => setShowPayPalButtons(!showPayPalButtons)}
                    className={`w-[177px] h-[80px] rounded-[20px] p-4 cursor-pointer transition-all duration-300 ${
                      showPayPalButtons
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

                {showPayPalButtons && (
                  <div className="mt-4 w-full">
                    {paypalError ? (
                      <div className="text-red-500 text-center mb-4 text-sm sm:text-base">
                        {paypalError.message ||
                          "Failed to load PayPal. Please try again."}
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

                {/* Payment Status Message */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
