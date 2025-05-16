// Load environment variables
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const paypal = require("@paypal/checkout-server-sdk");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Transaction = require("./models/Transaction");

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "game-recharge-store",
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    console.log("Full connection string:", process.env.MONGODB_URI);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if we can't connect to the database
  });

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both ports
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// PayPal configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Payment API is running",
    endpoints: {
      test: "/api/test",
      register: "/api/register",
      login: "/api/login",
      getUserBalance: "/api/user/balance",
      addFunds: "/api/user/add-funds",
      getTransactions: "/api/user/transactions",
      processBankPayment: "/api/process-bank-payment",
    },
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// User Registration endpoint
app.post("/api/register", async (req, res) => {
  try {
    console.log("Received registration request:", req.body);
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log("Missing required fields:", {
        username,
        email,
        password: !!password,
      });
      return res.status(400).json({
        error: "Missing required fields",
        required: ["username", "email", "password"],
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      console.log("User already exists:", { username, email });
      return res.status(400).json({
        error: "User already exists",
        details:
          existingUser.username === username
            ? "Username already taken"
            : "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      balance: 0,
    });

    console.log("Attempting to save new user:", { username, email });
    await user.save();
    console.log("User saved successfully");

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data (excluding password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to register user",
      details: error.message,
    });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "password"],
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      error: "Failed to login",
      details: error.message,
    });
  }
});

// Protected route example
app.get("/api/user/profile", auth, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    balance: req.user.balance,
    createdAt: req.user.createdAt,
  });
});

// Get user by ID
app.get("/api/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get user balance
app.get("/api/user/balance/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ balance: user.balance });
  } catch (error) {
    console.error("Error getting user balance:", error);
    res.status(500).json({ error: "Failed to get user balance" });
  }
});

// Add funds to user balance
app.post("/api/user/add-funds", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.balance += amount;
    await user.save();

    // Record transaction
    const transaction = new Transaction({
      userId: user._id,
      amount,
      packageId: "DEPOSIT",
      type: "DEPOSIT",
      status: "COMPLETED",
    });
    await transaction.save();

    res.json({
      status: "success",
      message: "Funds added successfully",
      newBalance: user.balance,
      transaction: transaction,
    });
  } catch (error) {
    console.error("Error adding funds:", error);
    res.status(500).json({ error: "Failed to add funds" });
  }
});

// Get user transactions
app.get("/api/user/transactions/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(transactions);
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({ error: "Failed to get transactions" });
  }
});

// Bank payment endpoint
app.post("/api/process-bank-payment", async (req, res) => {
  try {
    const { userId, amount, packageId } = req.body;
    console.log("Received bank payment request:", {
      userId,
      amount,
      packageId,
    });

    // Validate input
    if (!userId || !amount || !packageId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Get user and check balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        error: "Insufficient balance",
        currentBalance: user.balance,
        requiredAmount: amount,
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user balance
      user.balance -= amount;
      await user.save({ session });

      // Record transaction
      const transaction = new Transaction({
        userId: user._id,
        amount,
        packageId,
        type: "PURCHASE",
        status: "COMPLETED",
      });
      await transaction.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.json({
        status: "success",
        message: "Payment processed successfully",
        transaction: transaction,
        newBalance: user.balance,
      });
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error processing bank payment:", error);
    res.status(500).json({
      error: error.message,
      details: "Failed to process payment",
    });
  }
});

// PayPal route
app.post("/api/create-paypal-order", async (req, res) => {
  try {
    const { amount, cardDetails } = req.body;
    console.log("Received payment request:", { amount, cardDetails });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (cardDetails) {
      console.log("Processing direct card payment...");
      // Validate card details
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        return res.status(400).json({ error: "Invalid card details" });
      }
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    // If card details are provided, use direct card payment
    if (cardDetails) {
      console.log("Creating order with card details...");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
          },
        ],
        payment_source: {
          card: {
            number: cardDetails.number,
            expiry: cardDetails.expiry,
            security_code: cardDetails.cvv,
            name: "Card Payment",
            billing_address: {
              address_line_1: "123 Main St",
              address_line_2: "Apt 1",
              admin_area_2: "San Jose",
              admin_area_1: "CA",
              postal_code: "95131",
              country_code: "US",
            },
          },
        },
      });
    } else {
      console.log("Creating order for PayPal button flow...");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
          },
        ],
      });
    }

    console.log("Sending request to PayPal...");
    const order = await paypalClient.execute(request);
    console.log("PayPal order created:", order.result);

    // Verify the order was created successfully
    if (!order.result || !order.result.id) {
      throw new Error("Failed to create PayPal order");
    }

    res.json({
      orderId: order.result.id,
      status: order.result.status,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({
      error: error.message,
      details: error.response?.body || "No additional details available",
    });
  }
});

// PayPal capture endpoint
app.post("/api/capture-paypal-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log("Capturing payment for order:", orderId);

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // First, get the order details to verify its status
    const getOrderRequest = new paypal.orders.OrdersGetRequest(orderId);
    const orderDetails = await paypalClient.execute(getOrderRequest);
    console.log("Order details:", orderDetails.result);

    if (orderDetails.result.status !== "APPROVED") {
      return res.status(400).json({
        error: "Order is not approved",
        status: orderDetails.result.status,
      });
    }

    // Proceed with capture
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    console.log("Sending capture request to PayPal...");
    const capture = await paypalClient.execute(request);
    console.log("PayPal capture response:", capture.result);

    // Check if the payment was successful
    if (capture.result.status === "COMPLETED") {
      // Get the payment details
      const paymentId =
        capture.result.purchase_units[0].payments.captures[0].id;
      console.log("Payment ID:", paymentId);

      res.json({
        status: "success",
        paymentId: paymentId,
        message: "Payment captured successfully",
      });
    } else {
      throw new Error("Payment capture failed");
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({
      error: error.message,
      details: error.response?.body || "No additional details available",
    });
  }
});

// Get all users (Admin route)
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password from results
    res.json({
      message: "Users retrieved successfully",
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/api/test`);
});
