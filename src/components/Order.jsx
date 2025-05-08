import React from "react";
import { motion } from "framer-motion";

const Order = ({ order }) => {
  // Function to get status color based on order status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Format date to show only DD/MM/YY
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg shadow-md p-2 lg:p-3 w-full"
      style={{
        background:
          "linear-gradient(152.13deg, #060A0E -19.62%, #3B4550 36.86%, #192531 93.34%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex flex-col">
        {/* Top row: Order ID, Game Name, and Status */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-3">
            <span
              className="text-white text-sm font-mono px-2 py-1 rounded"
              style={{
                background:
                  "linear-gradient(147.43deg, rgba(255, 255, 255, 0.48) 5.2%, rgba(59, 69, 80, 0.48) 65.03%, rgba(255, 255, 255, 0.48) 124.85%)",
              }}
            >
              #{order.id}
            </span>
            <h3 className="text-sm font-medium text-white">{order.gameName}</h3>
          </div>
          <motion.span
            whileHover={{ scale: 1.1 }}
            className={`text-sm font-medium ${getStatusColor(order.status)}`}
          >
            {order.status}
          </motion.span>
        </div>

        {/* Middle row: Price and Cash Back */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-2 lg:space-y-0">
            <div className="flex items-center space-x-1">
              <span className="text-gray-300">Price:</span>
              <span className="text-green-400 font-semibold">
                ${order.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-300">Cash Back:</span>
              <span className="text-green-400 font-semibold">
                ${order.cashBack.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: Date */}
        <div className="flex justify-end">
          <span className="text-gray-400 text-sm">
            {formatDate(order.date)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Order;
