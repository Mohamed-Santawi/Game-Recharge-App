import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import package1Image from "../assets/hero.jpeg";
import package2Image from "../assets/hero2.webp";
import cartIcon from "../assets/cart.png";
import { useCart } from "../contexts/CartContext";

const Package = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState("3632950 (6005)"); // Initial ID
  const [port, setPort] = useState("6005"); // Initial port
  const [username, setUsername] = useState("Player3632"); // Initial username
  const [isRestricted, setIsRestricted] = useState(false);
  const [showRestrictedPopup, setShowRestrictedPopup] = useState(false);
  const [showEmptyCartDialog, setShowEmptyCartDialog] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    handleBuyNow,
    handleCartClick,
  } = useCart();

  // Available packages with diamond classifications
  const packages = [
    {
      id: 1,
      name: "Basic Pack",
      crystals: 5000,
      crystalBreakdown: "2000 + 3000",
      price: 29.99,
      cashPrice: 25.99,
      features: ["Basic game items", "Starter boost", "24/7 support"],
      popular: false,
    },
    {
      id: 2,
      name: "Standard Pack",
      crystals: 10000,
      crystalBreakdown: "4000 + 6000",
      price: 49.99,
      cashPrice: 44.99,
      features: ["Premium items", "Exclusive boost", "Priority support"],
      popular: true,
    },
    {
      id: 3,
      name: "Premium Pack",
      crystals: 15000,
      crystalBreakdown: "6000 + 9000",
      price: 79.99,
      cashPrice: 69.99,
      features: ["Elite items", "Maximum boost", "VIP support"],
      popular: false,
    },
    {
      id: 4,
      name: "Diamond Pack",
      crystals: 20000,
      crystalBreakdown: "8000 + 12000",
      price: 99.99,
      cashPrice: 89.99,
      features: ["Diamond items", "Elite boost", "Premium support"],
      popular: false,
    },
    {
      id: 5,
      name: "Mythic Pack",
      crystals: 30000,
      crystalBreakdown: "12000 + 18000",
      price: 149.99,
      cashPrice: 129.99,
      features: ["Mythic items", "Legendary boost", "24/7 VIP support"],
      popular: false,
    },
    {
      id: 6,
      name: "Glory Pack",
      crystals: 50000,
      crystalBreakdown: "20000 + 30000",
      price: 199.99,
      cashPrice: 179.99,
      features: ["Glory items", "Ultimate boost", "Personal support"],
      popular: false,
    },
  ];

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle ID input and extract port
  const handleIdChange = (e) => {
    const value = e.target.value;
    setAccountId(value);

    // Extract port from parentheses
    const portMatch = value.match(/\((\d+)\)/);
    if (portMatch) {
      setPort(portMatch[1]);
    } else {
      setPort("");
    }

    // Simulate username fetch (replace with actual API call)
    if (value.length > 5) {
      setUsername("Player" + value.slice(-4));
    } else {
      setUsername("");
    }

    // Check if ID is from restricted country (example logic)
    const restrictedPorts = ["6005", "6006", "6007"]; // Example restricted ports
    const isRestricted = portMatch && restrictedPorts.includes(portMatch[1]);
    setIsRestricted(isRestricted);
    if (isRestricted) {
      setShowRestrictedPopup(true);
    }
  };

  const handleAddToCart = (packageItem) => {
    addToCart(packageItem);
    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 1000);
  };

  const handlePaymentCheckout = () => {
    navigate("/payment", {
      state: {
        cart: cartItems,
        username:
          currentUser?.displayName?.split(" ")[0] ||
          currentUser?.email?.split("@")[0] ||
          "User",
      },
    });
  };

  const handleCartIconClick = () => {
    if (cartItems.length === 0) {
      setShowEmptyCartDialog(true);
    } else {
      handlePaymentCheckout();
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with enhanced gradient */}
      <div
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(135deg, #060B11 0%, #1A1A1A 50%, #2C1810 100%)",
          opacity: 0.95,
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="bg-[#121A22]/40 backdrop-blur-lg border-b border-[#EEAD22]/10 p-4">
          <div className="max-w-7xl mx-auto flex justify-end items-center space-x-4">
            <Link
              to="/wallet"
              className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-[#EEAD22]/20 hover:bg-[#121A22]/60 hover:shadow-[#EEAD22]/20"
            >
              <span className="mr-2">💰</span>
              Wallet
            </Link>
            <div className="relative">
              <button
                onClick={handleCartIconClick}
                className="relative inline-flex gap-4 items-center justify-center px-6 py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-[#EEAD22]/20 hover:bg-[#121A22]/60 hover:shadow-[#EEAD22]/20"
              >
                <img src={cartIcon} alt="Cart" className="w-6 h-6 mr-2" />
                Cart
                {cartItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0  transform -translate-x-1/2 bg-[#EEAD22] text-white text-[12px] font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-[#EEAD22]/20"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#EEAD22] flex items-center justify-center text-white font-bold">
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
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-4">
          <div className="max-w-7xl mx-auto">
            {/* Account Information Box */}
            <div className="bg-[#121A22]/40 rounded-lg p-6 mb-8 border border-[#EEAD22]/10 backdrop-blur-lg">
              <h2 className="text-2xl font-semibold mb-4 text-[#EEAD22]">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account ID
                  </label>
                  <input
                    type="text"
                    value={accountId.split(" ")[0]}
                    onChange={handleIdChange}
                    placeholder="Enter ID (e.g., 3632950)"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-[#EEAD22]/20 focus:border-[#EEAD22] focus:ring-1 focus:ring-[#EEAD22] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Port
                  </label>
                  <input
                    type="text"
                    value={port}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-[#EEAD22]/20 text-white"
                  />
                </div>
              </div>
            </div>

            {/* User Card with Background Images */}
            <div className=" top-20 z-40 mb-8">
              <div className="relative rounded-lg overflow-hidden border border-[#EEAD22]/30 backdrop-blur-lg h-[250px] max-w-[800px] mx-auto">
                {/* Background Images Container */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 h-full relative">
                    <img
                      src={package1Image}
                      alt="Background"
                      className="w-full h-full object-cover opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#EEAD22]/10 to-transparent" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="w-1/2 h-full relative">
                    <img
                      src={package2Image}
                      alt="Background"
                      className="w-full h-full object-cover opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-[#EEAD22]/10 to-transparent" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-4xl font-bold mb-2 drop-shadow-lg bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
                      {currentUser?.displayName || username}
                    </h3>
                    <p className="text-3xl font-semibold drop-shadow-lg bg-gradient-to-r from-[#FFA500] to-[#FFD700] text-transparent bg-clip-text">
                      ID: {accountId.split(" ")[0]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 max-w-[1000px] mx-auto">
              {packages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-br from-[#121A22]/80 to-[#1A1A1A]/80 rounded-lg border ${
                    pkg.popular ? "border-[#EEAD22]" : "border-[#EEAD22]/20"
                  } backdrop-blur-lg hover:border-[#EEAD22]/50 transition-all duration-300 relative shadow-lg hover:shadow-[#EEAD22]/10`}
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden flex flex-col h-full">
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#EEAD22] to-[#FFD700] text-white px-1 py-0.5 rounded-full text-[7px] font-bold">
                        Popular
                      </div>
                    )}
                    <div className="p-1.5 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-[#EEAD22] mb-0.5">
                        {pkg.crystals} 💎
                      </div>
                      <div className="flex items-center space-x-1 mb-1">
                        <div className="text-[8px] font-bold text-[#EEAD22]">
                          ${pkg.price}
                        </div>
                        <div className="text-[7px] text-[#EEAD22]/80">
                          (${pkg.cashPrice})
                        </div>
                      </div>
                      <div className="flex space-x-0.5 w-full">
                        <button
                          onClick={() => handleBuyNow(pkg)}
                          className="flex-1 bg-gradient-to-r from-[#EEAD22] to-[#FFD700] hover:from-[#FFD700] hover:to-[#EEAD22] text-white px-0.5 py-0.5 rounded text-[7px] transition-all duration-300 shadow-lg hover:shadow-[#EEAD22]/20"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => handleAddToCart(pkg)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white px-0.5 py-0.5 rounded text-[7px] transition-colors"
                        >
                          Cart
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/Tablet Layout */}
                  <div className="hidden sm:block p-4">
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#EEAD22] to-[#FFD700] text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-semibold mb-2 text-[#EEAD22]">
                      {pkg.name}
                    </h3>
                    <div className="text-3xl font-bold mb-2 text-[#EEAD22]">
                      {pkg.crystals} 💎
                    </div>
                    <div className="text-lg text-[#EEAD22]/80 mb-4">
                      ({pkg.crystalBreakdown})
                    </div>
                    <div className="flex flex-col space-y-2 mb-6">
                      <div className="text-xl font-bold text-[#EEAD22]">
                        ${pkg.price}
                      </div>
                      <div className="text-lg text-[#EEAD22]/80">
                        Cash Pack: ${pkg.cashPrice}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleBuyNow(pkg)}
                        className="flex-1 bg-gradient-to-r from-[#EEAD22] to-[#FFD700] hover:from-[#FFD700] hover:to-[#EEAD22] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#EEAD22]/20"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleAddToCart(pkg)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Restricted Country Popup */}
        {showRestrictedPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-[#121A22] p-6 rounded-lg max-w-md mx-4 backdrop-blur-lg border border-[#EEAD22]/20">
              <h3 className="text-xl font-bold text-red-400 mb-4">
                Top-up Restricted
              </h3>
              <p className="text-gray-300 mb-6">
                Top-up is not allowed for accounts from this region. Please use
                a different account.
              </p>
              <button
                onClick={() => setShowRestrictedPopup(false)}
                className="w-full bg-[#EEAD22] hover:bg-[#EEAD22]/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Empty Cart Dialog */}
        {showEmptyCartDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-[#121A22] p-6 rounded-lg max-w-md mx-4 backdrop-blur-lg border border-[#EEAD22]/20">
              <h3 className="text-xl font-bold text-center text-[#EEAD22] mb-4">
                Empty Cart
              </h3>
              <p className="text-gray-300 mb-6">Your cart is empty.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowEmptyCartDialog(false)}
                  className="bg-[#EEAD22] hover:bg-[#EEAD22]/90 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #eead22;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #ffd700;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Package;
