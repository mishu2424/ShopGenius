import React, { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// import { CardElement, Elements, useElements, useStripe } from "../../src";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./CheckOutForm.css";
import useRole from "../../hooks/useRole";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../Shared/LoadingSpinner";
const CheckOutForm = ({
  closeModal,
  bookingInfo,
  value,
  refetch,
  comment,
  deliveryPreference,
}) => {
  const { user, setToggle, toggleHandler } = useAuth();
  const [role] = useRole();
  const [clientSecret, setClientSecret] = useState("");
  const [cardError, setCardError] = useState("");
  const [processing, setProcessing] = useState(false);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  console.log(bookingInfo);

  useEffect(() => {
    const total = bookingInfo?.totalPrice;
    // console.log(total);
    if (total > 1) {
      getClientSecret({ total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingInfo?.total]);

  const getClientSecret = async (price) => {
    // console.log(price);
    const { data } = await axiosSecure.post(`/create-payment-intent`, price);
    // console.log(data);
    setClientSecret(data.clientSecret);
  };

  const { mutateAsync, isPending: isUpdatingBooking } = useMutation({
    mutationKey: ["book"],
    mutationFn: async (booking) => {
      const { data } = await axiosSecure.post("/booking", booking);
      return data;
    },
    onError: () => {
      setCardError(`Something went wrong during the payment!`);
      toast.error(`Something went wrong during the payment!`);
    },
  });

  const { mutateAsync: updateQuantityStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationKey: ["product-sold_count"],
      mutationFn: async () => {
        console.log(bookingInfo?.sold_count + bookingInfo?.quantity);
        const { data } = await axiosSecure.patch(
          `/update-product-sold-count/${bookingInfo._id}`,
          { sold_count: bookingInfo?.sold_count + bookingInfo?.quantity }
        );
        return data;
      },
      onSuccess: () => {
        toast.success("Order placed successfully");
        closeModal();
        setToggle(true);
        refetch();
        // toggleHandler();
        navigate("/dashboard/my-orders");
      },
      onError: () => {
        toast.error(
          `Something went wrong while updating product's sold count status!`
        );
        closeModal();
      },
    });

  const handleBookings = async (e) => {
    e.preventDefault();

    if (!value) {
      return toast.error("Please provide the delivery address!");
    }

    if (!deliveryPreference) {
      return toast.error("Please provide the delivery preference!");
    }

    // if (role === "admin")
    //   return toast.error("Admin account cannot book the rooms");

    if (!value) {
      return toast.error("Please provide your location");
    }

    if (user?.email === bookingInfo?.seller?.email)
      return toast.error("You are not allowed to buy your own product!");

    setProcessing(true);
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      setProcessing(false);
      return;
    }
    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      setProcessing(false);
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      // console.log("[error]", error);
      setProcessing(false);
      setCardError(error.message);
      return;
    } else {
      setCardError("");
      // console.log("[PaymentMethod]", paymentMethod);
    }

    const { error: confirmError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            email: user?.email || "",
            name: user?.displayName || "",
          },
        },
      });

    if (confirmError) {
      setCardError(confirmError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      const { title, brand, category, totalPrice, quantity } = bookingInfo;
      const booking = {
        title,
        brand,
        category,
        totalPrice,
        quantity,
        selectedImage: bookingInfo?.selectedImage,
        selectedColor: bookingInfo?.selectedColor,
        productBookingId: bookingInfo?._id,
        sold_count: bookingInfo?.sold_count + bookingInfo?.quantity,
        date: new Date(),
        transactionId: paymentIntent.id,
        user: {
          email: user?.email,
          name: user?.displayName,
          photoURL: user?.photoURL,
        },
        seller: bookingInfo?.seller,
        deliveryStatus: "Pending",
        deliveryInformation: {
          address: value,
          comment,
          deliveryPreference,
        },
      };
      // console.log(booking);

      delete booking._id;
      try {
        await mutateAsync(booking);
        await updateQuantityStatus();
      } catch (err) {
        toast.error(err.message);
      } finally {
        closeModal();
        setProcessing(false);
      }
      setProcessing(false);
    }
  };

  // console.log(bookingInfo);

  if (isUpdatingBooking || isUpdatingStatus) return <LoadingSpinner />;
  return (
    <form onSubmit={handleBookings}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      <div className="flex mt-2 justify-around">
        <button
          type="submit"
          disabled={!stripe || processing || bookingInfo?.booked}
          className="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          {processing ? (
            <ImSpinner9 className="animate-spin m-auto" />
          ) : (
            `Pay $${(Number((bookingInfo?.totalPrice) + 7.49).toFixed(2))}`
          )}
        </button>
        <button
          onClick={closeModal}
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          No
        </button>
      </div>
      <p className="text-xs text-red-500">{cardError}</p>
    </form>
  );
};

export default CheckOutForm;
