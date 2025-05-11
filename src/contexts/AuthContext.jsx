import { createContext, useContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import {
  getDoc,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cashBackRate, setCashBackRate] = useState(2.5);
  const [totalCashBack, setTotalCashBack] = useState(0);
  const [todaySpending, setTodaySpending] = useState(0);
  const [orders, setOrders] = useState([
    {
      id: "3688 💎",
      gameName: "PUBG Mobile",
      price: 29.99,
      cashBack: 0.75,
      status: "completed",
      description: "PUBG Mobile UC Purchase",
      date: new Date().toISOString(),
    },
    {
      id: "566 💎",
      gameName: "Free Fire",
      price: 19.99,
      cashBack: 0.5,
      status: "pending",
      description: "Free Fire Diamond Purchase",
      date: new Date().toISOString(),
    },
    {
      id: "424 💎",
      gameName: "Mobile Legends",
      price: 49.99,
      cashBack: 1.25,
      status: "completed",
      description: "Mobile Legends Diamond Purchase",
      date: new Date().toISOString(),
    },
  ]);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [discountCodes, setDiscountCodes] = useState([
    { code: "KZQMPW83", userProfit: 5, customerProfit: 10 },
    { code: "ABC123XY", userProfit: 7, customerProfit: 12 },
    { code: "XYZ789AB", userProfit: 3, customerProfit: 8 },
    // Add more predefined codes as needed
  ]);
  const [currentDiscountCode, setCurrentDiscountCode] = useState("KZQMPW83");
  const [userProfit, setUserProfit] = useState(5); // Default 5% profit for user
  const [customerProfit, setCustomerProfit] = useState(10); // Default 10% profit for customer
  const [isAdmin, setIsAdmin] = useState(false);

  // Update the redirect result handler
  useEffect(() => {
    let isHandlingRedirect = false;

    const handleRedirectResult = async () => {
      if (isHandlingRedirect) return;
      isHandlingRedirect = true;

      try {
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);

        if (result) {
          console.log("Redirect sign in successful, initializing user data...");
          // Initialize user data immediately after successful redirect
          await initializeUserData(result.user);
          // Force update the current user
          setCurrentUser(result.user);
          // Set loading to false to ensure the app renders
          setLoading(false);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      } finally {
        isHandlingRedirect = false;
      }
    };

    // Call immediately and also set up a small delay to ensure we catch the result
    handleRedirectResult();
    const timeoutId = setTimeout(handleRedirectResult, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Function to initialize user data
  const initializeUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          totalCashBack: 0,
          todaySpending: 0,
          referralEarnings: 0,
          referralCode: `REF${user.uid.slice(0, 6).toUpperCase()}`,
          currentDiscountCode: "KZQMPW83",
          isAdmin: false,
        });
      }
    } catch (error) {
      console.error("Error initializing user data:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Simple configuration for better compatibility
      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("Starting Google Sign In process...");

      // Use popup for all devices
      const result = await signInWithPopup(auth, provider);
      await initializeUserData(result.user);
      return result;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  function logout() {
    return signOut(auth);
  }

  // Function to calculate cash back for a transaction
  function calculateCashBack(amount) {
    const cashBack = (amount * cashBackRate) / 100;
    setTotalCashBack((prev) => prev + cashBack);
    return cashBack;
  }

  // Function to add spending amount
  function addSpending(amount) {
    setTodaySpending((prev) => prev + amount);
    calculateCashBack(amount);
  }

  // Function to update order status
  function updateOrderStatus(orderId, status) {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  }

  // Function to add referral earnings
  function addReferralEarning(amount) {
    setReferralEarnings((prev) => prev + amount);
  }

  // Generate referral code when user signs up
  useEffect(() => {
    if (currentUser && !referralCode) {
      const code = `REF${currentUser.uid.slice(0, 6).toUpperCase()}`;
      setReferralCode(code);
    }
  }, [currentUser, referralCode]);

  // Reset daily spending at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const timeUntilMidnight = tomorrow - now;

    const resetSpending = () => {
      setTodaySpending(0);
    };

    const timer = setTimeout(resetSpending, timeUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  // Update the auth state change handler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User signed in" : "No user");

      if (user) {
        try {
          console.log("Loading user data...");
          // Load user data including discount code
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          if (userData) {
            console.log("User data loaded successfully");
            setIsAdmin(userData.isAdmin || false);
            setCurrentDiscountCode(userData.currentDiscountCode || "KZQMPW83");
            setTotalCashBack(userData.totalCashBack || 0);
            setTodaySpending(userData.todaySpending || 0);
            setReferralEarnings(userData.referralEarnings || 0);
            setReferralCode(userData.referralCode || "");
          } else {
            console.log("No user data found, initializing...");
            await initializeUserData(user);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        console.log("User signed out, resetting states...");
        // Reset states when user logs out
        setCurrentDiscountCode("");
        setIsAdmin(false);
        setTotalCashBack(0);
        setTodaySpending(0);
        setReferralEarnings(0);
        setReferralCode("");
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Function to update discount code percentages (admin only)
  const updateDiscountCodePercentages = async (
    code,
    newUserProfit,
    newCustomerProfit
  ) => {
    if (!isAdmin) {
      throw new Error("Only admins can update discount percentages");
    }

    try {
      const updatedCodes = discountCodes.map((dc) =>
        dc.code === code
          ? {
              ...dc,
              userProfit: newUserProfit,
              customerProfit: newCustomerProfit,
            }
          : dc
      );

      await updateDoc(doc(db, "settings", "discountCodes"), {
        codes: updatedCodes,
        lastUpdated: new Date().toISOString(),
      });

      setDiscountCodes(updatedCodes);
    } catch (error) {
      console.error("Error updating discount code percentages:", error);
      throw error;
    }
  };

  // Function to get profit percentages for a discount code
  const getDiscountCodeProfits = (code) => {
    const discountCode = discountCodes.find((dc) => dc.code === code);
    return discountCode || { userProfit: 0, customerProfit: 0 };
  };

  // Initialize discount codes in Firestore
  const initializeDiscountCodes = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "discountCodes"));
      if (!settingsDoc.exists()) {
        // If no discount codes exist, create them
        const initialCodes = [
          { code: "KZQMPW83", userProfit: 5, customerProfit: 10 },
          { code: "ABC123XY", userProfit: 7, customerProfit: 12 },
          { code: "XYZ789AB", userProfit: 3, customerProfit: 8 },
        ];
        await setDoc(doc(db, "settings", "discountCodes"), {
          codes: initialCodes,
          lastUpdated: new Date().toISOString(),
        });
        setDiscountCodes(initialCodes);
      } else {
        // Load existing codes
        setDiscountCodes(settingsDoc.data().codes);
      }
    } catch (error) {
      console.error("Error initializing discount codes:", error);
    }
  };

  // Modified login function to ensure discount codes are loaded
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      setIsAdmin(userData?.isAdmin || false);

      // Initialize discount codes if not already done
      await initializeDiscountCodes();

      // Set default discount code if none exists
      if (!userData?.currentDiscountCode) {
        const defaultCode = "KZQMPW83";
        await updateDoc(doc(db, "users", user.uid), {
          currentDiscountCode: defaultCode,
        });
        setCurrentDiscountCode(defaultCode);
      } else {
        setCurrentDiscountCode(userData.currentDiscountCode);
      }

      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Function to set current discount code
  const setUserDiscountCode = async (code) => {
    if (!discountCodes.find((dc) => dc.code === code)) {
      throw new Error("Invalid discount code");
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        currentDiscountCode: code,
      });
      setCurrentDiscountCode(code);
    } catch (error) {
      console.error("Error setting discount code:", error);
      throw error;
    }
  };

  // Calculate profits for an order
  const calculateOrderProfits = (orderAmount) => {
    const userProfitAmount = (orderAmount * userProfit) / 100;
    const customerDiscountAmount = (orderAmount * customerProfit) / 100;
    return {
      userProfitAmount,
      customerDiscountAmount,
    };
  };

  // Modified addOrder function to include profit calculations
  const addOrder = async (order) => {
    try {
      const profits = calculateOrderProfits(order.amount);
      const orderWithProfits = {
        ...order,
        date: new Date().toISOString(),
        userProfit: profits.userProfitAmount,
        customerDiscount: profits.customerDiscountAmount,
        discountCode: currentDiscountCode,
      };

      const newOrderRef = await addDoc(
        collection(db, "orders"),
        orderWithProfits
      );
      setOrders([...orders, { id: newOrderRef.id, ...orderWithProfits }]);

      // Update user's total earnings
      const newTotalCashBack = totalCashBack + profits.userProfitAmount;
      setTotalCashBack(newTotalCashBack);
      await updateDoc(doc(db, "users", currentUser.uid), {
        totalCashBack: newTotalCashBack,
      });
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  // Modified signup function to ensure discount codes are initialized
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Initialize discount codes if not already done
      await initializeDiscountCodes();

      // Create user document with initial data
      const defaultCode = "KZQMPW83";
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        totalCashBack: 0,
        todaySpending: 0,
        referralEarnings: 0,
        referralCode: generateReferralCode(),
        currentDiscountCode: defaultCode,
        isAdmin: false,
      });

      // Set initial states
      setCurrentDiscountCode(defaultCode);
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Initialize user's discount code and profits
  const initializeUserDiscounts = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData.discountCode) {
        // Generate and set new discount code if none exists
        const newDiscountCode = generateRandomDiscountCode();
        await updateDoc(doc(db, "users", user.uid), {
          discountCode: newDiscountCode,
          userProfit: 5, // Default profit percentage
          customerProfit: 10, // Default customer profit percentage
        });
        setCurrentDiscountCode(newDiscountCode);
        setUserProfit(5);
        setCustomerProfit(10);
      } else {
        // Use existing values
        setCurrentDiscountCode(userData.discountCode);
        setUserProfit(userData.userProfit || 5);
        setCustomerProfit(userData.customerProfit || 10);
      }
    } catch (error) {
      console.error("Error initializing user discounts:", error);
    }
  };

  // Add useEffect to initialize discount codes when the app starts
  useEffect(() => {
    if (currentUser) {
      initializeDiscountCodes();
    }
  }, [currentUser]);

  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    cashBackRate,
    totalCashBack,
    calculateCashBack,
    todaySpending,
    addSpending,
    orders,
    addOrder,
    updateOrderStatus,
    referralEarnings,
    addReferralEarning,
    referralCode,
    discountCodes,
    currentDiscountCode,
    isAdmin,
    updateDiscountCodePercentages,
    setUserDiscountCode,
    getDiscountCodeProfits,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
