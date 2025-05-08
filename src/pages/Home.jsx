import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import ninjaImage from "../assets/ninja.jpg";

const Home = () => {
  const { currentUser, logout } = useAuth();
  const [userInitial, setUserInitial] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.displayName) {
      setUserInitial(currentUser.displayName.charAt(0).toUpperCase());
    }
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleWalletClick = () => {
    console.log("Current user state:", currentUser); // Debug log
    if (currentUser) {
      navigate("/wallet");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Background */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${ninjaImage})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#0a0a0a",
          width: "100%",
          height: "100%",
          objectFit: "fill",
        }}
      />

      {/* Mobile-specific background */}
      <div
        className="fixed inset-0 w-full h-full md:hidden"
        style={{
          backgroundImage: `url(${ninjaImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#0a0a0a",
          transform: "scale(1.2)",
        }}
      />

      {/* Dark Overlay */}
      <div
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(159.42deg, rgba(6, 10, 14, 0.7) 3.3%, rgba(59, 69, 80, 0.7) 48.96%, rgba(25, 37, 49, 0.7) 94.61%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <nav className="p-0">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="text-white text-2xl font-bold">
                {/* Removed Game Recharge text */}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWalletClick}
                    className="relative inline-flex items-center justify-center px-4 py-2 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60 hover:shadow-primary/20 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white/10 before:transition-all before:duration-300 hover:before:bg-primary/80"
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mr-2"
                    >
                      💰
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Wallet
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                      animate={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.button>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 focus:outline-none">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#60A5FA] flex items-center justify-center text-white font-bold text-lg">
                          {userInitial}
                        </div>
                      )}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <div className="px-4 py-2 text-white">
                          {currentUser.displayName}
                        </div>
                        <div className="px-4 py-2 text-white">
                          {currentUser.email}
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60 hover:shadow-primary/20 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white/10 before:transition-all before:duration-300 hover:before:bg-primary/80"
                >
                  Login
                </Link>
              )}
            </motion.div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 100,
              }}
              className="text-5xl md:text-7xl font-bold text-white mb-4"
            >
              Game Recharge
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl md:text-3xl text-gray-300 mb-2 font-light"
            >
              Your Gaming Journey Starts Here
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Experience the future of gaming with instant recharges, exclusive
              rewards, and premium support. Join our community of gamers and
              unlock endless possibilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-4xl mb-6 text-primary transition-transform duration-300"
                >
                  🎮
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Instant Recharge
                </h3>
                <p className="text-gray-400">
                  Get your game credits instantly with our lightning-fast system
                </p>
              </motion.div>
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-4xl mb-6 text-primary transition-transform duration-300"
                >
                  💎
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Premium Support
                </h3>
                <p className="text-gray-400">
                  24/7 dedicated support for all your gaming needs
                </p>
              </motion.div>
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-4xl mb-6 text-primary transition-transform duration-300"
                >
                  🎁
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Exclusive Rewards
                </h3>
                <p className="text-gray-400">
                  Special bonuses and rewards for our loyal gamers
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center text-gray-300"
              >
                <span className="text-2xl mr-2">⭐</span>
                <span>Trusted by 100K+ Gamers</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center text-gray-300"
              >
                <span className="text-2xl mr-2">⚡</span>
                <span>Instant Delivery</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center text-gray-300"
              >
                <span className="text-2xl mr-2">🔒</span>
                <span>Secure Transactions</span>
              </motion.div>
            </motion.div>

            <motion.div
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mb-8"
            >
              <button
                onClick={handleWalletClick}
                className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60 hover:shadow-primary/20 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white/10 before:transition-all before:duration-300 hover:before:bg-primary/80"
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Home;
