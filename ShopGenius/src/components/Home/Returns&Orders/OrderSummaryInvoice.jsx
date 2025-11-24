import React from "react";
import { Package, Download, Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import moment from "moment";

export default function OrderSummaryInvoice() {
  const { order_id } = useParams();
  console.log(order_id);

  const { data: summary, isLoading: orderSummaryLoading } = useQuery({
    queryKey: ["order-summary", order_id],
    queryFn: async () => {
      const { data } = await axiosSecure(`/order-summary/${order_id}`);
      return data;
    },
  });

  console.log(summary);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // console.log(summary?.invoice?.invoice_pdf);
    if (summary?.invoice.invoice_pdf && summary?.invoice.invoice_pdf !== "#") {
      window.open(summary?.invoice?.invoice_pdf, "_blank");
    } else {
      alert("Invoice PDF is not available");
    }
  };
  const date = moment(summary?.date);
  const oneMonthLater = date.add(1, "months");

  if (orderSummaryLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Order Summary</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Order placed {moment(summary?.date).format("MMMM Do, YYYY")}
              </p>
              <p>Order number {summary?._id}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-md font-medium transition flex items-center gap-2"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 pb-8 border-b">
          {/* Ship To */}
          <div>
            <h3 className="font-bold mb-3">Ship to</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{summary?.user?.name}</p>
              <p>{summary?.deliveryInformation?.address}</p>
            </div>
          </div>

          {/* Payment Method */}
          {/*           <div>
            <h3 className="font-bold mb-3">Payment method</h3>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-8 h-6" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="2" fill="#1434CB"/>
                <path d="M11 10L14 7M14 13L11 10M11 10H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-700">{order.payment_method.type} •••• {order.payment_method.last4}</span>
            </div>
          </div> */}

          {/* Order Summary */}
          <div>
            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Item(s) Subtotal:</span>
                <span className="font-medium">
                  ${summary?.invoice?.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping & Handling:</span>
                <span className="font-medium">
                  {/* ${order.shipping.toFixed(2)} */}
                  {summary?.invoice?.shipping_cost ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total before tax:</span>
                <span className="font-medium">
                  ${summary?.invoice?.total_excluding_tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated PST/RST/QST:</span>
                <span className="font-medium">
                  $
                  {summary?.shipping_cost
                    ? summary?.shipping_cost.toFixed(2)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated GST/HST:</span>
                <span className="font-medium">$0</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Grand Total:</span>
                <span className="text-red-700">
                  ${summary?.invoice?.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Delivery Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold">Delivery Status</h2>
          </div>
          <p className="text-gray-600 text-sm">{summary?.deliveryStatus}</p>
        </div>
        {/* Product Details */}
        <div className="flex gap-6 mb-8">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
              <img
                src={summary?.selectedImage}
                className="h-full w-full"
                alt=""
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-grow">
            <a
              href="#"
              className="text-blue-600 hover:underline text-base mb-2 block"
            >
              {summary?.title}
            </a>
            <p className="text-sm text-gray-600 mb-1">
              Sold by:{" "}
              <span className="text-blue-600">
                {summary?.seller?.storeName ?? summary?.seller?.name}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Return items: Eligible through{" "}
              {moment(oneMonthLater.toISOString()).format("YYYY-MM-DD")}
            </p>
            {/* <p className="text-base font-medium">${item.price.toFixed(2)}</p> */}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition flex items-center gap-2"
          >
            <Download size={18} />
            Download Invoice PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 border-2 border-gray-300 hover:bg-gray-50 rounded-md font-medium transition flex items-center gap-2"
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </div>
        {/* Invoice Details */}
        <div className="mt-8 pt-6 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Invoice Number:{" "}
              <span className="font-medium">{summary?.invoice?.id}</span>
            </p>
            <p>
              Transaction ID:{" "}
              <span className="font-mono">{summary?.transactionId}</span>
            </p>
            <p>
              Status:{" "}
              <span className="text-green-600 font-medium uppercase">
                {summary?.invoice?.status}
              </span>
            </p>
            <p className="text-gray-400 italic mt-2">
              {summary?.invoice.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
