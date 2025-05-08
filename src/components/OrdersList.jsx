import React from "react";
import Order from "./Order";

const OrdersList = ({ orders }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Your Orders
      </h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <Order key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrdersList;
