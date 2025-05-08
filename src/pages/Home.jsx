import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import OptimizedBackground from "../components/OptimizedBackground";

// Lazy load non-critical components
const LazyLoadedContent = lazy(() => import("../components/LazyLoadedContent"));

const Home = () => {
  const { currentUser, logout } = useAuth();
  const [userInitial, setUserInitial] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLazyContent, setShowLazyContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentUser?.displayName) {
      setUserInitial(currentUser.displayName.charAt(0).toUpperCase());
    }
  }, [currentUser]);

  useEffect(() => {
    // Show content immediately on mobile
    if (isMobile) {
      setIsLoading(false);
      setShowLazyContent(true);
    } else {
      // Add slight delay for desktop to ensure smooth transitions
      setTimeout(() => {
        setIsLoading(false);
        setShowLazyContent(true);
      }, 200);
    }
  }, [isMobile]);

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
      {/* Loading State - Minimal for mobile */}
      {!isMobile && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#0a0a0a] z-50 transition-opacity duration-150 ${
            isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-sm md:text-base">
              Loading your experience...
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`transition-opacity duration-150 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Optimized Background with LQIP */}
        <OptimizedBackground isMobile={isMobile} />

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
              initial={isMobile ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0 : 0.3 }}
              className="text-center"
            >
              {/* Critical Content */}
              <motion.h1
                initial={isMobile ? false : { opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: isMobile ? 0 : 0.8,
                  delay: isMobile ? 0 : 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                className="text-5xl md:text-7xl font-bold text-white mb-4"
              >
                Game Recharge
              </motion.h1>

              {/* Lazy Loaded Content */}
              {showLazyContent && (
                <Suspense
                  fallback={
                    <div className="animate-pulse">
                      <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
                    </div>
                  }
                >
                  <LazyLoadedContent
                    handleWalletClick={handleWalletClick}
                    isMobile={isMobile}
                  />
                </Suspense>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
