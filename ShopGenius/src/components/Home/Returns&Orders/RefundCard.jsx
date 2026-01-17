import { Download } from "lucide-react";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";

const RefundCard = ({ item }) => {
  console.log(item);
  const handleDownloadPDF = () => {
    // console.log(summary?.invoice?.invoice_pdf);
    if (item?.invoice.invoice_pdf) {
      window.open(item?.invoice?.invoice_pdf, "_blank");
    } else {
      alert("Invoice PDF is not available");
    }
  };
  return (
    <div
      key={item._id}
      className="col-span-12 grid grid-cols-12 gap-4 p-4 rounded-lg shadow-sm bg-gray-50"
    >
      {/* Left: Image */}
      <div className="col-span-12 md:col-span-4 flex justify-center items-center">
        <img
          src={item.selectedImage}
          alt={item.title}
          className="w-32 h-32 max-h-48 object-contain rounded-md"
        />
      </div>

      {/* Right: Details */}
      <div className="col-span-12 md:col-span-8 flex flex-col justify-between">
        <Link to={`/product/${item?.productBookingId}`}><h2 className="text-lg font-semibold link-hover hover:text-blue-700">{item.title}</h2></Link>
        <p className="text-gray-600">Brand: {item.brand}</p>
        <p className="text-gray-600">
          Category: {item.category} | Quantity: {item.quantity}
        </p>
        <p className="text-gray-800 font-semibold">
          Total Price: {item.currency.toUpperCase()} {item.totalPrice}
        </p>
        <p className="text-gray-600">Delivery Status: {item.deliveryStatus}</p>
        <p className="text-gray-600">
          Order Date: {moment(item.date).format("MMMM/dddd/YYYY")} | Return End Date: {moment(item?.returnedDate).format("MMMM/dddd/YYYY")}
        </p>
        <p className="text-gray-500 text-sm">
          Transaction ID: {item.transactionId}
        </p>
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition flex items-center gap-2 lg:w-1/3 w-10/12 my-3 cursor-pointer"
        >
          <Download size={18} />
          Download Invoice PDF
        </button>
      </div>
    </div>
  );
};

export default RefundCard;
