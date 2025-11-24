import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import { CheckCircle, Clock } from "lucide-react";

const OrderDetails = () => {
  const { order_id } = useParams();
  console.log(order_id);

  const formatCurrency = (value, currency = "cad") => {
    const locale = currency?.toLowerCase() === "cad" ? "en-CA" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency?.toUpperCase() || "CAD",
    }).format(value);
  };

  const StatusBadge = ({ status }) => {
    const lower = (status || "").toLowerCase();
    const bg =
      lower === "delivered"
        ? "bg-emerald-100 text-emerald-800"
        : lower === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : lower === "failed"
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-800";

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${bg}`}
      >
        {lower === "delivered" ? (
          <CheckCircle size={16} />
        ) : (
          <Clock size={16} />
        )}
        {status}
      </span>
    );
  };

  const { data: summary, isLoading: orderSummaryLoading } = useQuery({
    queryKey: ["order-summary", order_id],
    queryFn: async () => {
      const { data } = await axiosSecure(`/order-summary/${order_id}`);
      return data;
    },
  });

  const s = summary ?? {};

  // use uploaded image path if selectedImage missing
  const productImage =
    s.selectedImage || "/mnt/data/06e998bf-b4f3-407b-8cd0-e6bcdf12264e.png";

  console.log(summary);
  if (orderSummaryLoading) return <LoadingSpinner />;
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Product header */}
      <div className="flex items-start gap-6 bg-white border border-slate-200 rounded-md p-6 shadow-sm">
        <div className="w-36 h-36 flex-shrink-0 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={productImage}
            alt={s.title || "product"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold leading-tight mb-2">
            {s.title}
          </h2>
          <div className="text-sm text-slate-600 mb-3">
            <span className="block">
              Sold by{" "}
              <strong className="text-slate-800">
                {s.seller?.storeName || s.seller?.name}
              </strong>
            </span>
            <span className="block">{s.seller?.location}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-lg font-bold">
              {formatCurrency(s.totalPrice ?? s.originalPrice ?? 0, s.currency)}
            </div>
            <div className="text-sm text-slate-500">Qty: {s.quantity ?? 1}</div>
          </div>

          <div className="mt-4">
            <Link
              to={`/product/${s.productBookingId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View product details
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={s.deliveryStatus || "Pending"} />
          <div className="text-sm text-slate-500">
            Order placed:{" "}
            <span className="text-slate-700">{s.date}</span>
          </div>
          <div className="text-sm text-slate-500">
            Order ID: <span className="text-slate-700">{s?._id}</span>
          </div>
        </div>
      </div>

      {/* Delivery block */}
      <div className="bg-white border border-slate-200 rounded-md p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
            </div>

            <div>
              <div className="font-semibold text-slate-800">
                {s.deliveryStatus === "Delivered"
                  ? `Delivered ${s?.date}`
                  : s.deliveryStatus || "Pending"}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {s.deliveryInformation?.deliveryPreference
                  ? `${s.deliveryInformation?.deliveryPreference} • ${s.deliveryInformation?.address}`
                  : s.deliveryInformation?.address ||
                    "Delivery details not available"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-5 py-2 rounded-full border border-slate-300 text-sm hover:bg-slate-50 transition"
              onClick={() => window.alert("Track package functionality")}
            >
              Track package
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700 mb-1">
              How was your delivery?
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-sm">
                👍 It was great
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-sm">
                👎 Not so great
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            <div>
              <strong>Transaction:</strong> {s?.transactionId}
            </div>
            <div className="mt-2">
              <strong>Invoice:</strong>{" "}
              <a
                className="text-blue-600 hover:underline"
                href={s.invoice?.id ? `#invoice-${s?.invoice?.id}` : "#"}
              >
                View invoice
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Help / Return / Review sections */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            Need help with your item?
          </h3>
          <Link
            className="text-blue-600 hover:underline text-sm"
            to={`/orders/${s._id}/returns`}
          >
            Return items
          </Link>
          <div className="text-xs text-slate-500 mt-1">
            Eligible through {s.returningEndDate}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            How's your item?
          </h3>
          <div className="flex flex-col gap-2">
            <Link
              className="text-blue-600 hover:underline text-sm"
              to={`/product/${s.productBookingId}/review`}
            >
              Write a product review
            </Link>
            <Link
              className="text-blue-600 hover:underline text-sm"
              to={`/seller/${s.seller?.storeName || s.seller?.email}/feedback`}
            >
              Leave seller feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Order summary details */}
      <div className="bg-white border border-slate-200 rounded-md p-6 text-sm text-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div>
              <strong>Buyer</strong>
            </div>
            <div className="mt-1">{s.user?.name}</div>
            <div className="text-xs text-slate-500">{s.user?.email}</div>
          </div>

          <div>
            <div>
              <strong>Seller</strong>
            </div>
            <div className="mt-1">{s.seller?.name}</div>
            <div className="text-xs text-slate-500">{s.seller?.email}</div>
          </div>

          <div>
            <div className="mt-3">
              <strong>Item</strong>
            </div>
            <div className="text-slate-800 mt-1">{s.title}</div>
            <div className="text-xs text-slate-500">
              Brand: {s.brand} • Category: {s.category}
            </div>
          </div>

          <div>
            <div className="mt-3">
              <strong>Price</strong>
            </div>
            <div className="text-slate-800 mt-1">
              {formatCurrency(s.totalPrice, s.currency)}
            </div>
            <div className="text-xs text-slate-500">Qty: {s.quantity}</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          <div>Session ID: {s.sessionId}</div>
          <div>Product Booking ID: {s.productBookingId}</div>
          <div>Invoice ID: {s.invoice?.id}</div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
