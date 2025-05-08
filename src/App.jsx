import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UserWallet from "./pages/UserWallet";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  console.log("ProtectedRoute - currentUser:", currentUser); // Debug log
  console.log("ProtectedRoute - loading:", loading); // Debug log

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(159.42deg, #060A0E 3.3%, #3B4550 48.96%, #192531 94.61%)",
        }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    console.log("ProtectedRoute - Redirecting to login"); // Debug log
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div
          className="min-h-screen flex flex-col"
          style={{
            background:
              "linear-gradient(159.42deg, #060A0E 3.3%, #3B4550 48.96%, #192531 94.61%)",
          }}
        >
          <Header />
          <main className="flex-grow">
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
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
