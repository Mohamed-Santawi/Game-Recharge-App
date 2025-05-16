import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./PayPalCardForm.css";

const PayPalCardForm = ({ amount, onSuccess, onError }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    components: "buttons,card-fields",
    style: {
      layout: "vertical",
      color: "blue",
      shape: "rect",
      label: "pay",
    },
    "enable-funding": "card",
    "disable-funding": "paylater,venmo",
    "data-sdk-integration-source": "button-factory",
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      onSuccess(details);
    });
  };

  const renderPaymentOptions = () => {
    return (
      <div className="payment-options">
        <button
          className="payment-option-btn"
          onClick={() => setPaymentMethod("card")}
        >
          <img
            src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
            alt="Card"
            style={{ height: "26px" }}
          />
          <span style={{ marginLeft: "8px" }}>Debit or Credit Card</span>
        </button>
      </div>
    );
  };

  return (
    <div className="paypal-card-form">
      <PayPalScriptProvider options={initialOptions}>
        {!paymentMethod ? (
          renderPaymentOptions()
        ) : (
          <div className="card-fields-container">
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "pay",
              }}
              fundingSource="card"
            />
            <button
              className="back-button"
              onClick={() => setPaymentMethod(null)}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Back to Payment Options
            </button>
          </div>
        )}
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCardForm;
