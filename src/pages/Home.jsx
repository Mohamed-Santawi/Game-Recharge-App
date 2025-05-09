import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ninjaImage from "../assets/ninja.webp";

// Lazy load non-critical components
const LazyLoadedContent = lazy(() => import("../components/LazyLoadedContent"));

const Home = () => {
  const { currentUser, logout } = useAuth();
  const [userInitial, setUserInitial] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
    // Optimize image loading for mobile
    if (isMobile) {
      // On mobile, show content immediately and load image in background
      setIsLoading(false);
      const img = new Image();
      img.src = ninjaImage;
    } else {
      // On desktop, wait for image to load
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.src = ninjaImage;
    }

    // Failsafe timeout
    const timeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timeout);
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
    if (currentUser) {
      navigate("/wallet");
    } else {
      navigate("/login");
    }
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
        className="fixed inset-0 bg-[#0a0a0a]"
        style={{
          backgroundImage: `url(${ninjaImage})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
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
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 to-[#1a1a1a]/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation - Simplified for mobile */}
        <nav className="p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              {/* Logo */}
            </Link>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleWalletClick}
                    className="px-4 py-2 text-white bg-[#121A22]/40 rounded-lg border border-white/5 hover:bg-[#121A22]/60"
                  >
                    <span className="mr-2">💰</span>
                    Wallet
                  </button>
                  <div className="relative group">
                    <button className="flex items-center space-x-2">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#60A5FA] flex items-center justify-center text-white font-bold">
                          {userInitial}
                        </div>
                      )}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-[#121A22]/90 rounded-lg shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <div className="px-4 py-2 text-white">
                          {currentUser.displayName}
                        </div>
                        <div className="px-4 py-2 text-white">
                          {currentUser.email}
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
              ) : (
                <Link
                  to="/login"
                  className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60 hover:shadow-primary/20 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white/10 before:transition-all before:duration-300 hover:before:bg-primary/80"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content - Simplified for mobile */}
        <main className="max-w-7xl mx-auto px-4 pt-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-4">
              Game Recharge
            </h1>

            {/* Lazy Loaded Content with instant mobile loading */}
            {isMobile ? (
              <LazyLoadedContent
                handleWalletClick={handleWalletClick}
                isMobile={isMobile}
              />
            ) : (
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
