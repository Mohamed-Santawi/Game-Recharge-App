import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ghostImage from "../assets/ghost.png";
import cardImage from "../assets/card.png";
import { motion, AnimatePresence } from "framer-motion";
import OrdersList from "../components/OrdersList";

const UserWallet = () => {
  const {
    currentUser,
    cashBackRate,
    totalCashBack,
    todaySpending,
    orders,
    referralEarnings,
    referralCode,
    discountCodes,
    currentDiscountCode,
    isAdmin,
    updateDiscountCodePercentages,
    setUserDiscountCode,
    getDiscountCodeProfits,
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [isBackButtonVisible, setIsBackButtonVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [newOrder, setNewOrder] = useState({
    gameName: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsBackButtonVisible(scrollPosition < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = ghostImage;
    img.onload = () => {
      setImageLoaded(true);
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
  }, []);

  if (!currentUser) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddOrder = () => {
    if (!newOrder.gameName || !newOrder.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const order = {
      id: Date.now().toString(),
      gameName: newOrder.gameName,
      price: parseFloat(newOrder.amount),
      cashBack: parseFloat(newOrder.amount) * (cashBackRate / 100),
      status: "pending",
      description: newOrder.description,
      date: new Date().toISOString(),
    };

    addOrder(order);
    addSpending(order.price);
    setNewOrder({ gameName: "", amount: "", description: "" });
    setShowAddOrderModal(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Loading State - Always present initially */}
      <div
        className={`fixed inset-0 flex items-center justify-center bg-[#0a0a0a] z-50 transition-opacity duration-500 ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Full Screen Background */}
        <div
          className="fixed inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${ghostImage})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#0a0a0a",
            width: "100%",
            height: "100%",
            objectFit: "fill",
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />

        {/* Mobile-specific background - Optimized */}
        <div
          className="fixed inset-0 w-full h-full md:hidden"
          style={{
            backgroundImage: `url(${ghostImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#0a0a0a",
            transform: "scale(1.2) translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />

        {/* Dark Overlay - Optimized */}
        <div
          className="fixed inset-0"
          style={{
            background:
              "linear-gradient(159.42deg, rgba(6, 10, 14, 0.6) 3.3%, rgba(59, 69, 80, 0.6) 48.96%, rgba(25, 37, 49, 0.6) 94.61%)",
            willChange: "opacity",
            transform: "translateZ(0)",
          }}
        />

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: isBackButtonVisible ? 1 : 0,
            x: isBackButtonVisible ? 0 : -20,
            transition: { duration: 0.3 },
          }}
          className={`fixed top-4 left-4 z-50 transition-all duration-300 ${
            isBackButtonVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <Link
            to="/"
            className="relative inline-flex items-center justify-center px-3 lg:px-6 py-2 lg:py-2.5 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60 hover:shadow-primary/20 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white/10 before:transition-all before:duration-300 hover:before:bg-primary/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden lg:inline">Back to Home</span>
          </Link>
        </motion.div>

        {/* Main Content with Card and Sidebar */}
        <div className="relative z-10 min-h-screen flex items-start justify-center p-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 max-w-7xl w-full items-start justify-center -mt-4">
            {/* Business Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full lg:w-[500px] h-[650px] lg:h-[750px] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Card Background */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${cardImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 p-6 lg:p-8 flex flex-col">
                {/* User Profile */}
                <div className="flex items-center space-x-4 mb-4 lg:mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 lg:w-16 lg:h-16 bg-primary/20 rounded-full flex items-center justify-center text-lg lg:text-2xl font-bold text-white overflow-hidden"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.displayName?.[0] ||
                      currentUser.email?.[0] ||
                      "U"
                    )}
                  </motion.div>
                  <div className="text-left">
                    <h2 className="text-base lg:text-xl font-bold text-white">
                      {currentUser.displayName || currentUser.email}
                    </h2>
                    <p className="text-gray-300 text-xs lg:text-sm">
                      Premium Member
                    </p>
                  </div>
                </div>

                {/* Balance Section */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-gray-300 text-xs lg:text-sm mb-2">
                    Current Balance
                  </h3>
                  <p className="text-2xl lg:text-4xl font-bold text-white mb-3">
                    $0.00
                  </p>
                  <div className="flex space-x-3 lg:space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all duration-300 text-xs lg:text-base"
                    >
                      Add Funds
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all duration-300 text-xs lg:text-base"
                    >
                      Withdraw
                    </motion.button>
                  </div>
                </div>

                {/* Cash Back Section - Mobile Layout */}
                <div className="mb-6 lg:mb-8">
                  <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-2">
                    <div className="text-center">
                      <h3 className="text-gray-300 text-[10px] lg:text-sm mb-1">
                        Cash Back Rate
                      </h3>
                      <span className="text-lg lg:text-3xl font-bold text-yellow-400 animate-pulse block">
                        +{cashBackRate}%
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-gray-300 text-[10px] lg:text-sm mb-1">
                        Total Earned
                      </h3>
                      <p className="text-lg lg:text-2xl font-bold text-green-400">
                        ${totalCashBack.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-gray-300 text-[10px] lg:text-sm mb-1">
                        Today's Spending
                      </h3>
                      <p className="text-lg lg:text-2xl font-bold text-red-400">
                        ${todaySpending.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    Resets at midnight
                  </p>
                </div>

                {/* Personal Discount Code Section */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-300 text-[10px] lg:text-sm">
                      Personal Discount Code
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(currentDiscountCode);
                        alert("Discount code copied to clipboard!");
                      }}
                      className="text-primary hover:text-primary/80 transition-colors text-[10px] lg:text-sm"
                    >
                      Copy
                    </motion.button>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 lg:p-4 mb-3">
                    <p className="text-white font-mono text-center text-sm lg:text-lg tracking-wider">
                      {currentDiscountCode}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="bg-black/20 rounded-lg p-3 lg:p-4">
                      <p className="text-gray-400 text-[10px] lg:text-xs mb-2">
                        Your Profit
                      </p>
                      <p className="text-green-400 font-bold text-sm lg:text-lg mb-1">
                        {
                          getDiscountCodeProfits(currentDiscountCode)
                            ?.userProfit
                        }
                        %
                      </p>
                      <p className="text-gray-400 text-[10px] lg:text-xs">
                        Earn{" "}
                        {
                          getDiscountCodeProfits(currentDiscountCode)
                            ?.userProfit
                        }
                        % on every purchase
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 lg:p-4">
                      <p className="text-gray-400 text-[10px] lg:text-xs mb-2">
                        Customer Profit
                      </p>
                      <p className="text-blue-400 font-bold text-sm lg:text-lg mb-1">
                        {
                          getDiscountCodeProfits(currentDiscountCode)
                            ?.customerProfit
                        }
                        %
                      </p>
                      <p className="text-gray-400 text-[10px] lg:text-xs">
                        Customers save{" "}
                        {
                          getDiscountCodeProfits(currentDiscountCode)
                            ?.customerProfit
                        }
                        % with your code
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-auto grid grid-cols-3 gap-3 lg:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/5 backdrop-blur-lg p-2 lg:p-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-[10px] lg:text-sm"
                  >
                    Recent Games
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/5 backdrop-blur-lg p-2 lg:p-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-[10px] lg:text-sm"
                  >
                    Payment Methods
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/5 backdrop-blur-lg p-2 lg:p-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-[10px] lg:text-sm"
                  >
                    Support
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full lg:w-[600px] h-auto lg:h-[750px] bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-2 lg:p-8"
            >
              {/* Tabs */}
              <div className="flex space-x-2 lg:space-x-4 mb-4 lg:mb-6">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base ${
                    activeTab === "orders"
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("earnings")}
                  className={`px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base ${
                    activeTab === "earnings"
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Earnings
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("discounts")}
                    className={`px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base ${
                      activeTab === "discounts"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    Discounts
                  </button>
                )}
              </div>

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="flex-1 bg-[#121A22]/40 backdrop-blur-sm rounded-2xl p-2 lg:p-6 border border-white/5 h-auto lg:h-[calc(100%-60px)]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-white text-center lg:text-left">
                      Order History
                    </h2>
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddOrderModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base w-full lg:w-auto"
                      >
                        Add Order
                      </motion.button>
                    </div>
                  </div>
                  <div className="w-full -mx-2 lg:mx-0">
                    <OrdersList orders={orders} />
                  </div>
                </div>
              )}

              {/* Earnings Tab */}
              {activeTab === "earnings" && (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-gray-300 text-sm mb-2">
                      Referral Code
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-mono">{referralCode}</p>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(referralCode)
                        }
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-gray-300 text-sm mb-2">
                      Referral Earnings
                    </h4>
                    <p className="text-2xl font-bold text-green-400">
                      ${referralEarnings.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Earned from referrals
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-gray-300 text-sm mb-2">
                      Cash Back Earnings
                    </h4>
                    <p className="text-2xl font-bold text-green-400">
                      ${totalCashBack.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Total cash back earned
                    </p>
                  </div>
                </div>
              )}

              {/* Discounts Tab (Admin Only) */}
              {isAdmin && activeTab === "discounts" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Manage Discount Codes
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Add new discount code logic here
                      }}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      Add New Code
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {discountCodes.map((dc) => (
                      <motion.div
                        key={dc.code}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-mono text-lg">
                              {dc.code}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Current Status:{" "}
                              {dc.code === currentDiscountCode
                                ? "Active"
                                : "Inactive"}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setUserDiscountCode(dc.code)}
                            className={`px-3 py-1 rounded text-sm ${
                              dc.code === currentDiscountCode
                                ? "bg-green-500/20 text-green-400"
                                : "bg-primary/20 text-primary hover:bg-primary/30"
                            }`}
                          >
                            {dc.code === currentDiscountCode
                              ? "Active"
                              : "Set Active"}
                          </motion.button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">
                              User Profit
                            </p>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={dc.userProfit}
                              onChange={(e) =>
                                updateDiscountCodePercentages(
                                  dc.code,
                                  Number(e.target.value),
                                  dc.customerProfit
                                )
                              }
                              className="w-full px-3 py-2 bg-black/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">
                              Customer Profit
                            </p>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={dc.customerProfit}
                              onChange={(e) =>
                                updateDiscountCodePercentages(
                                  dc.code,
                                  dc.userProfit,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 bg-black/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center text-sm">
                          <p className="text-gray-400">
                            User earns:{" "}
                            <span className="text-green-400">
                              {dc.userProfit}%
                            </span>
                          </p>
                          <p className="text-gray-400">
                            Customer saves:{" "}
                            <span className="text-blue-400">
                              {dc.customerProfit}%
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Add Order Modal */}
        <AnimatePresence>
          {showAddOrderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#121A22] rounded-2xl p-4 lg:p-6 w-full max-w-2xl border border-white/5 overflow-y-auto max-h-[90vh]"
              >
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">
                  Add New Order
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm lg:text-base">
                        Game Name
                      </label>
                      <input
                        type="text"
                        value={newOrder.gameName}
                        onChange={(e) =>
                          setNewOrder({
                            ...newOrder,
                            gameName: e.target.value,
                          })
                        }
                        className="w-full bg-[#1A2634] border border-white/10 rounded-lg px-3 lg:px-4 py-2 text-white focus:outline-none focus:border-primary text-sm lg:text-base"
                        placeholder="Enter game name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm lg:text-base">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        value={newOrder.amount}
                        onChange={(e) =>
                          setNewOrder({ ...newOrder, amount: e.target.value })
                        }
                        className="w-full bg-[#1A2634] border border-white/10 rounded-lg px-3 lg:px-4 py-2 text-white focus:outline-none focus:border-primary text-sm lg:text-base"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm lg:text-base">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newOrder.description}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-[#1A2634] border border-white/10 rounded-lg px-3 lg:px-4 py-2 text-white focus:outline-none focus:border-primary text-sm lg:text-base"
                      placeholder="Enter description"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddOrderModal(false)}
                      className="px-3 lg:px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddOrder}
                      className="bg-primary hover:bg-primary/90 text-white px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base"
                    >
                      Add Order
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserWallet;
