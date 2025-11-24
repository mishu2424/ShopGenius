import React from "react";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  RotateCcw,
  Star,
  Eye,
  ShoppingBag,
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";

export default function OrderCard({ order }) {
  const date = moment(order?.date);
  const oneMonthLater = date.add(1, "months");
  console.log(order);
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">ORDER PLACED</p>
          <p className="font-medium">
            {moment(order?.date).format("MMMM Do, YYYY")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">TOTAL</p>
          <p className="font-medium">${order?.totalPrice}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">SHIP TO</p>
          <Link to={`/dashboard/profile`}>
            <p className="font-medium text-blue-600">
              {order?.user?.name || ""} ▼
            </p>
          </Link>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm text-gray-600">
            ORDER # {order?.productBookingId}
          </p>
          <div className="flex gap-4 text-sm">
            <Link to={`/returns&orders/order-details/${order?._id}`}>
              <h5 className="text-blue-600 hover:underline">
                View order details
              </h5>
            </Link>
            <h5 className="text-blue-600 hover:underline">
              <Link to={`/returns&orders/order-summary/${order?._id}`}>
                Invoice ▼
              </Link>
            </h5>
          </div>
        </div>
      </div>

      {/* Delivery Status */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Package className="text-green-600" size={28} />
          {order?.deliveryStatus}
        </h2>
      </div>

      {/* Product Section */}
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
            <img
              className="w-full h-full"
              src={order?.selectedImage}
              alt=""
              srcset=""
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-grow">
          <Link to={`/product/${order?.productBookingId}`}>
            <h3 className="text-blue-600 hover:underline text-lg mb-2 block">
              {order?.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mb-4">
            Return items: Eligible through{" "}
            {moment(oneMonthLater.toISOString()).format("YYYY-MM-DD")}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link to={`/product/${order?.productBookingId}`}>
              <button className="cursor-pointer px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-full font-medium transition flex items-center gap-2">
                <ShoppingBag size={18} />
                Buy again
              </button>
            </Link>
            {/*             <button className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition flex items-center gap-2">
              <Eye size={18} />
              View Your Item
            </button> */}
            <button className="cursor-pointer px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition flex items-center gap-2">
              <Star size={18} />
              Write a Review
            </button>
            <button className="cursor-pointer px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition flex items-center gap-2">
              <MessageSquare size={18} />
              Leave Feedback
            </button>
            <button className="cursor-pointer px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition flex items-center gap-2">
              <MessageSquare size={18} />
              Ask a Question
            </button>
            <button className="cursor-pointer px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition flex items-center gap-2">
              <RotateCcw size={18} />
              Return Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
