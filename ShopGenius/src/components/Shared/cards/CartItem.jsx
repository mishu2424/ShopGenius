import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";

const CartItem = ({ item, handleRemove, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(item?.quantity);

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    setQuantity(newQty);
    onQuantityChange(item._id, newQty);
  };
  return (
    <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 py-4">
      {/* Product Image */}
      <div className="flex-shrink-0 w-full md:w-40 h-40 bg-gray-50  rounded flex items-center justify-center overflow-hidden">
        <img
          src={item?.selectedImage}
          alt={item?.title}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col justify-between w-full">
        <div>
          <Link to={`/product/${item?.productId}`} className="cursor-pointer">
            <h2 className="text-lg font-semibold text-gray-900 hover:text-[#007185] cursor-pointer">
              {item?.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-600">
            Brand: <span className="font-medium">{item?.brand}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {item?.description}
          </p>
          <p
            className={`text-sm mt-1 ${
              item?.availability?.status === "in_stock"
                ? "text-green-700"
                : item?.availability?.status === "low_stock"
                ? "text-amber-400"
                : "text-red-600"
            }`}
          >
            {item?.availability?.status === "in_stock"
              ? "In Stock"
              : item?.availability?.status === "low_stock"
              ? "low-stock"
              : "Out of Stock"}
          </p>
        </div>

        {/* Quantity, Remove, and Price */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm">Qty:</h3>
            <button className="btn border border-gray-300">
              <span
                onClick={() => handleQtyChange(quantity + 1)}
                className="btn-sm text-xl cursor-pointer"
              >
                <FaPlus />
              </span>
              {quantity}
              <span
                onClick={() => handleQtyChange(quantity - 1)}
                className="btn-sm text-xl cursor-pointer"
              >
                <FaMinus />
              </span>
            </button>
          </div>

          <button
            onClick={() => handleRemove(item?._id)}
            className="flex items-center gap-1 text-sm text-[#007185] hover:text-red-600 transition cursor-pointer"
          >
            <FaTrashAlt className="text-xs" /> Remove
          </button>

          <div className="text-lg font-semibold text-gray-900">
            ${item?.totalPrice?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
