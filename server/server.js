// Load environment variables
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypal = require("@paypal/checkout-server-sdk");

// Load environment variables
dotenv.config();

const app = express();

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

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Payment API is running",
    endpoints: {
      test: "/api/test",
      createPaymentIntent: "/api/create-payment-intent",
      createPayPalOrder: "/api/create-paypal-order",
      capturePayPalOrder: "/api/capture-paypal-order",
    },
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Stripe payment endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
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
        success: true,
        capture: capture.result,
        paymentId: paymentId,
        message: "Payment captured successfully",
        status: capture.result.status,
        amount: capture.result.purchase_units[0].amount.value,
        currency: capture.result.purchase_units[0].amount.currency_code,
      });
    } else {
      throw new Error(
        `Payment capture failed with status: ${capture.result.status}`
      );
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({
      error: error.message,
      details: error.response?.body || "No additional details available",
    });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/api/test`);
});
