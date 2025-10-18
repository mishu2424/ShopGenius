import { FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const CartItem = ({ item,handleRemove }) => {

  return (
    <Link to={`/product/${item?.productId}`} className="cursor-pointer">
      <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 py-4">
        {/* Product Image */}
        <div className="flex-shrink-0 w-full md:w-40 h-40 bg-gray-50  rounded flex items-center justify-center overflow-hidden">
          <img
            src={item?.img}
            alt={item?.title}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between w-full">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 hover:text-[#007185] cursor-pointer">
              {item?.title}
            </h2>
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
                  : "text-red-600"
              }`}
            >
              {item?.availability?.status === "in_stock"
                ? "In Stock"
                : "Out of Stock"}
            </p>
          </div>

          {/* Quantity, Remove, and Price */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor={`qty-${item._id}`} className="text-sm">
                Qty:
              </label>
              <select
                id={`qty-${item._id}`}
                value={item.orderQuantity}
                disabled
                className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-gray-100 cursor-not-allowed"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <button
              onClick={()=>handleRemove(item?._id)}
              className="flex items-center gap-1 text-sm text-[#007185] hover:text-red-600 transition"
            >
              <FaTrashAlt className="text-xs" /> Remove
            </button>

            <div className="text-lg font-semibold text-gray-900">
              ${item?.price?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CartItem;
