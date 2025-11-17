import { format } from "date-fns";
import PropTypes from "prop-types";
import { useState } from "react";
import DeleteModal from "../Modal/DeleteModal";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { Link } from "react-router-dom";
import UpdateDeliveryModal from "../Modal/UpdateDeliveryModal";

const BookingDataRow = ({ order, refetch, dashboardStatus }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState(order?.deliveryStatus || "N/A");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const { mutateAsync: cancelOrderAsync, isPending } = useMutation({
    mutationKey: ["cancel-order", user?.email],
    mutationFn: async (reason) => {
      const { data } = await axiosSecure.delete(
        `/cancel-order/${order?._id}?reason=${reason}`
      );
      return data;
    },
    onError: () => {
      toast.error(`Something went wrong while canceling the order!`);
    },
  });
  const { mutateAsync: updateQuantityStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationKey: ["reduce-product-sold_count"],
      mutationFn: async () => {
        const { data } = await axiosSecure.patch(
          `/update-product-sold-count/${order.productBookingId}`,
          { sold_count: order?.sold_count - order?.quantity }
        );
        return data;
      },
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        refetch();
        setLoading(false);
      },
      onError: () => {
        toast.error(
          `Something went wrong while updating product sold count status!`
        );
        setIsDeleteModalOpen(false);
        setLoading(false);
      },
    });

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    const reason = e.target.reason.value;
    if (order?.deliveryStatus === "Left-the-warehouse") {
      return toast.error("You can not cancel it at this moment as it already left the warehouse.");
    }
    try {
      await cancelOrderAsync(reason);
      const data = await updateQuantityStatus();
      console.log(data);
      if (data.modifiedCount > 0) {
        toast.success("Order has been canceled");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // update delivery status
  const {
    mutateAsync: updateDeliveryStatusAsync,
    isPending: updateDeliveryStatusPending,
  } = useMutation({
    mutationKey: ["delivery-status"],
    mutationFn: async (deliveryStatus) => {
      const { data } = await axiosSecure.patch(
        `/update-delivery-status/${order?._id}`,
        {
          deliveryStatus,
        }
      );
      return data;
    },
    onSuccess: () => {
      setIsOpen(false);
      refetch();
      setLoading(false);
    },
    onError: () => {
      setIsOpen(false);
      toast.error(
        `Something went wrong while updating the product's delivery status!`
      );
      setLoading(false);
    },
  });
  const modalHandler = async (deliveryStatus) => {
    setLoading(true);
    try {
      const data = await updateDeliveryStatusAsync(deliveryStatus);
      // console.log(data);
      if (data.modifiedCount > 0) {
        toast.success(`Delivery Status has been updated`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (isPending || isUpdatingStatus || updateDeliveryStatusPending)
    return <LoadingSpinner />;
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
              <p className="text-gray-900 whitespace-no-wrap text-xs md:text-base link-hover hover:text-blue-400">
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
        <div className="flex items-center flex-col lg:flex-row">
          <div className="flex-shrink-0">
            <div className="block relative">
              <img
                alt="profile"
                src={order?.user?.photoURL}
                className="mx-auto object-cover rounded-full h-8 w-8 md:h-10 md:w-15"
              />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap">
              {order?.user?.name}
            </p>
          </div>
        </div>
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
        {order?.quantity}
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {dashboardStatus === "seller-dashboard" ? (
          <div className="space-x-2 space-y-2">
            <button
              onClick={() => setIsOpen(true)}
              className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
              ></span>
              <span className="relative">Update Delivery Status</span>
            </button>
            <UpdateDeliveryModal
              modalHandler={modalHandler}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              deliveryStatus={order?.deliveryStatus}
              loading={loading}
              selected={selected}
              setSelected={setSelected}
            />
            <button
              disabled={order?.deliveryStatus === "Delivered"}
              onClick={() => setIsDeleteModalOpen(true)}
              className="disabled:text-red-200 disabled:cursor-not-allowed relative cursor-pointer inline-block px-3 py-1 font-semibold text-red-900 leading-tight"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
              ></span>
              <span className="relative">Cancel</span>
            </button>
            {/* Delete modal */}
            <DeleteModal
              closeDeleteModal={closeDeleteModal}
              isDeleteModalOpen={isDeleteModalOpen}
              loading={loading}
              handleDeleteProduct={handleCancelOrder}
            />
          </div>
        ) : (
          <button
          disabled={order?.deliveryStatus === "Delivered"}
            onClick={() => setIsDeleteModalOpen(true)}
            className="disabled:text-red-200 disabled:cursor-not-allowed relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
            ></span>
            <span className="relative">Cancel</span>
          </button>
        )}
        {/* Delete modal */}
        <DeleteModal
          closeDeleteModal={closeDeleteModal}
          isDeleteModalOpen={isDeleteModalOpen}
          loading={loading}
          handleDeleteProduct={handleCancelOrder}
        />
      </td>
    </tr>
  );
};

BookingDataRow.propTypes = {
  order: PropTypes.object,
  refetch: PropTypes.func,
};

export default BookingDataRow;
