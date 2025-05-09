import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ghostImage from "../assets/ghost.webp";
import cardImage from "../assets/card.webp";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsBackButtonVisible(scrollPosition < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Optimize image loading for mobile
    if (isMobile) {
      // On mobile, show content immediately and load image in background
      setIsLoading(false);
      const img = new Image();
      img.src = ghostImage;
    } else {
      // On desktop, wait for image to load
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setIsLoading(false);
      };
      img.src = ghostImage;
    }

    // Failsafe timeout
    const timeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [isMobile]);

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
      {/* Loading State - Only show on desktop */}
      {!isMobile && isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] z-50">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Background - Optimized for mobile */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${ghostImage})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#0a0a0a",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...(isMobile && {
            willChange: "auto",
            transform: "none",
          }),
        }}
      />

      {/* Dark Overlay - Optimized */}
      <div
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(159.42deg, rgba(6, 10, 14, 0.6) 3.3%, rgba(59, 69, 80, 0.6) 48.96%, rgba(25, 37, 49, 0.6) 94.61%)",
        }}
      />

      {/* Back to Home Button */}
      <div
        className={`fixed top-4 left-4 z-50 transition-all duration-300 ${
          isBackButtonVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          to="/"
          className="relative inline-flex items-center justify-center px-3 lg:px-6 py-2 lg:py-2.5 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60"
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
      </div>

      {/* Main Content with Card and Sidebar */}
      <div className="relative z-10 min-h-screen flex items-start justify-center p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 max-w-7xl w-full items-start justify-center -mt-4">
          {/* Business Card */}
          <div className="relative w-full lg:w-[500px] h-[650px] lg:h-[750px] rounded-2xl overflow-hidden shadow-2xl">
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
                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-primary/20 rounded-full flex items-center justify-center text-lg lg:text-2xl font-bold text-white overflow-hidden">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    currentUser.displayName?.[0] ||
                    currentUser.email?.[0] ||
                    "U"
                  )}
                </div>
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
                  <button className="flex-1 bg-primary hover:bg-primary/90 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all duration-300 text-xs lg:text-base">
                    Add Funds
                  </button>
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all duration-300 text-xs lg:text-base">
                    Withdraw
                  </button>
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
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentDiscountCode);
                      alert("Discount code copied to clipboard!");
                    }}
                    className="text-primary hover:text-primary/80 transition-colors text-[10px] lg:text-sm"
                  >
                    Copy
                  </button>
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
                      {getDiscountCodeProfits(currentDiscountCode)?.userProfit}%
                    </p>
                    <p className="text-gray-400 text-[10px] lg:text-xs">
                      Earn{" "}
                      {getDiscountCodeProfits(currentDiscountCode)?.userProfit}%
                      on every purchase
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
                <button className="bg-white/5 backdrop-blur-lg p-2 lg:p-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-[10px] lg:text-sm">
                  Recent Games
                </button>
                <button className="bg-white/5 backdrop-blur-lg p-2 lg:p-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-[10px] lg:text-sm">
                  Payment Methods
                </button>
                <button className="bg-white/5 backdrop-blur-lg p-2 lg:p-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-[10px] lg:text-sm">
                  Support
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[600px] h-auto lg:h-[750px] bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-2 lg:p-8">
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

            {/* Content */}
            <div className="mt-4">
              {activeTab === "orders" && <OrdersList orders={orders} />}
              {/* Add other tab content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWallet;
