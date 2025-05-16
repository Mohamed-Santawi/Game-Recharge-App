import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Set the token in axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Fetch user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/profile"
      );
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || "Failed to login");
      throw error;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || "Failed to sign up");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
