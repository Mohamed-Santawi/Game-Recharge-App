import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const BuyNow = ({ item }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { handleBuyNow, cartItems } = useCart();

  const handleClick = () => {
    if (!item) {
      alert("Please select an item first");
      return;
    }

    if (cartItems.length === 0) {
      handleBuyNow(item);
      navigate("/payment", {
        state: {
          cart: [{ ...item, quantity: 1 }],
          username: currentUser?.displayName,
        },
      });
    } else {
      handleBuyNow(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#07080A]/40 border border-[#F9D94D]/20 hover:bg-[#07080A]/60 hover:shadow-[#F9D94D]/20"
    >
      Buy Now
    </button>
  );
};

export default BuyNow;
