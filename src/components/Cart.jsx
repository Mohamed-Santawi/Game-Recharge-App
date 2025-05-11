import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import cartIcon from "../assets/cart.png";

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems } = useCart();

  const handleCartClick = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    navigate("/payment", {
      state: {
        cart: cartItems,
        username: currentUser?.displayName,
      },
    });
  };

  return (
    <div className="relative cursor-pointer" onClick={handleCartClick}>
      <div className="relative inline-flex items-center justify-center p-2 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#07080A]/40 border border-[#F9D94D]/20 hover:bg-[#07080A]/60 hover:shadow-[#F9D94D]/20">
        <img src={cartIcon} alt="Cart" className="w-6 h-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#F9D94D] text-[#07080A] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default Cart;
