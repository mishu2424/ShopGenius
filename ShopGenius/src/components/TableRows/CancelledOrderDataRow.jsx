import { format } from "date-fns";
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import RefundModal from "../Modal/RefundModal";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
const CancelledOrderDataRow = ({ order, refetch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const { mutateAsync: refundProcess } = useMutation({
    mutationKey: ["refund-money", order?.sessionId],
    mutationFn: async ({ sessionId, reason, sellerEmail }) => {
      const { data } = await axiosSecure.patch(`/refund/${sessionId}`, {
        reason,
        sellerEmail,
      });
      return data;
    },
  });
  const refundMoney = async (refundStatus) => {
    // console.log(refundStatus);
    if (refundStatus) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Refund the money!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const sessionId = order?.sessionId;
          const reason = order?.reason;
          const sellerEmail = order?.refundInfo?.sellerEmail;
          await refundProcess({ sessionId, reason, sellerEmail });
          refetch();

          Swal.fire({
            title: "Refunded!",
            text: "Refunded money has been sent to customer's account.",
            icon: "success",
          });
        }
      });
    }
  };
  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="block relative">
              <img
                alt="profile"
                src={order?.selectedImage}
                className="mx-auto object-cover rounded hidden lg:flex h-10 w-15 "
              />
            </div>
          </div>
          <div className="ml-3">
            <Link to={`/product/${order?.productBookingId}`}>
              <p className=" whitespace-no-wrap text-xs md:text-base link-hover text-blue-600 hover:text-blue-400">
                {order?.title}
                <span className="inline-flex ml-1 text-xs text-green-900 text-xs md:text-base bg-green-100 p-2 font-semibold">
                  {" "}
                  (Current Status:
                  {order?.deliveryStatus === "Left-the-warehouse"
                    ? order?.deliveryStatus.split("-").join(" ")
                    : order?.deliveryStatus}
                  )
                </span>
              </p>
            </Link>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          {order?.refundInfo?.sellerEmail}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">${order?.totalPrice}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          {format(new Date(order?.date), "P")}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          {format(new Date(order?.returningEndDate), "P")}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          {format(new Date(order?.returnedDate), "P")}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{order?.quantity} </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p
          className={`${
            order?.refundStatus ? "text-green-700" : "text-gray-900"
          } whitespace-no-wrap font-semibold`}
        >
          {order?.refundStatus ? "true" : "false"}
        </p>
      </td>
      <td className="px-2 py-2 border-b border-gray-200 bg-white text-sm">
        {order?.refundStatus ? (
          <span className="text-gray-400 text-sm cursor-not-allowed">Already Refunded</span>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="btn text-xs bg-blue-600 text-white font-medium"
          >
            Process Refund
          </button>
        )}
        <RefundModal
          order={order}
          isOpen={isOpen}
          closeModal={closeModal}
          refundMoney={refundMoney}
        />
      </td>
    </tr>
  );
};

export default CancelledOrderDataRow;
