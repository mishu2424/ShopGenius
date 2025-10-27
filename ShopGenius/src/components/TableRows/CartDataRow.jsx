import React from "react";
import { useState } from "react";
import RemoveCartModal from "../Modal/RemoveCartModal";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BookingModal from "../Modal/BookingModal";

const CartDataRow = ({ cart, refetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const closeModal = () => {
    setIsOpen(false);
  };

  const closeBookingModal=()=>{
    setIsBookingModalOpen(false);
  }

  //   remove cart
  const { mutateAsync: deleteCartAsync } = useMutation({
    mutationKey: ["cart-delete"],
    mutationFn: async () => {
      const { data } = await axiosSecure.delete(`/cart/${cart?._id}`);
      return data;
    },
    onSuccess: () => {
      refetch();
      navigate(`/carts`);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const handleRemove = async () => {
    try {
      await deleteCartAsync();
      toast.success("🗑️ Removed from cart");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };
  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{cart?.title}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{cart?.brand}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        ${cart?.totalPrice}
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {cart?.quantity}
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
            ></span>
            <span className="relative">Buy</span>
          </button>
          <BookingModal closeModal={closeBookingModal} isOpen={isBookingModalOpen} bookingInfo={{...cart}} refetch={refetch}/>
          <button
            onClick={() => setIsOpen(true)}
            className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-red-900 leading-tight ml-1"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
            ></span>
            <span className="relative">Remove</span>
          </button>
          <RemoveCartModal
            isOpen={isOpen}
            closeModal={closeModal}
            handleRemove={handleRemove}
            loading={loading}
          />
        </>
      </td>
    </tr>
  );
};

export default CartDataRow;
