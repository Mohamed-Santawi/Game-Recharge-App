import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Game Recharge
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/wallet"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Wallet
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
