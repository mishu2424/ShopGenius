import React from "react";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const Cart = ({ cart, handleQuantityChange }) => {
  const [quantity, setQuantity] = useState(cart?.quantity);

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    setQuantity(newQty);
    handleQuantityChange(cart._id, newQty, cart);
  };

  console.log(cart);

  return (
    <div className="flex flex-col items-center gap-3 justify-center">
      <Link to={`/product/${cart?.productBookingId}`}>
        <img
          className="w-36 h-36 object-cover"
          src={cart?.selectedImage}
          alt={cart?.title}
        />
      </Link>
      <button className="btn rounded-full border border-gray-300">
        <span
          onClick={() => handleQtyChange(quantity + 1)}
          className="btn-sm text-xl cursor-pointer pr-3"
        >
          <FaPlus />
        </span>
        {quantity}
        <span
          onClick={() => handleQtyChange(quantity - 1)}
          className="btn-sm text-xl cursor-pointer pl-3"
        >
          <FaMinus />
        </span>
      </button>
    </div>
  );
};

export default Cart;
