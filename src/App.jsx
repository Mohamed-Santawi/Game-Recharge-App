import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UserWallet from "./pages/UserWallet";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Package from "./pages/Package";
import Payment from "./pages/Payment";
import AdminUsers from "./pages/AdminUsers";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080A]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#F9D94D]"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const isPackagePage = location.pathname === "/package";
  const isPaymentPage = location.pathname === "/payment";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(159.42deg, #060A0E 3.3%, #3B4550 48.96%, #192531 94.61%)",
      }}
    >
      {!isPackagePage && !isPaymentPage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isPackagePage && !isPaymentPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <UserWallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/package"
                element={
                  <ProtectedRoute>
                    <Package />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
