import PropTypes from "prop-types";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
  Select,
  Description,
  Textarea,
} from "@headlessui/react";
import { Fragment, useEffect, useMemo } from "react";
import CheckOutForm from "../Form/CheckOutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import copy from "copy-to-clipboard";
import { TiClipboard } from "react-icons/ti";
import { IoMdCheckmark } from "react-icons/io";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import clsx from "clsx";

import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import useMyLocation from "../../hooks/useMyLocation";
import { IoChevronDownCircleOutline } from "react-icons/io5";
import useSubscription from "../../hooks/useSubscription";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { FaSquareCheck } from "react-icons/fa6";
import { axiosCommon } from "../../hooks/useAxiosCommon";

const BookingModal = ({ closeModal, isOpen, bookingInfo, refetch }) => {
  const [copied, setCopied] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { location, getLocation } = useMyLocation();
  const [value, setValue] = useState(location?.address || null);
  console.log(bookingInfo);
  const [subscription, userSubscriptionLoading] = useSubscription();

  const { user } = useAuth();
  // ✅ ask for location when the modal opens (or when not available yet)
  useEffect(() => {
    if (isOpen && !location) getLocation();
    console.log(location);
  }, [isOpen, location, getLocation]);

  // ✅ when hook resolves, prefill the autocomplete
  useEffect(() => {
    if (location?.address) {
      setValue({ label: location.address, value: location });
    }
    console.log(location);
  }, [location]);

  const handleCopy = () => {
    copy("4242424242424242");
    setCopied(true);
  };

  const handleCouponCopy = () => {
    console.log(bookingInfo?.couponInfo?.minPurchaseAmount,bookingInfo?.totalPrice);
    if (
      !(bookingInfo?.couponInfo?.minPurchaseAmount <= bookingInfo?.totalPrice)
    ) {
      toast.error(
        `Order amount must need to be more than ${bookingInfo?.couponInfo?.minPurchaseAmount}`
      );
      return;
    }
    copy(bookingInfo?.couponInfo?.code);
    console.log(bookingInfo?.couponInfo?.code);
    setCouponCopied(true);
  };

  // checkout-payment
  const { mutateAsync: paymentAsync } = useMutation({
    mutationKey: ["checkout-payment"],
    mutationFn: async (items) => {
      const { data } = await axiosSecure.post(`/create-checkout-session`, {
        items,
      });
      console.log(data);
      return data;
    },
    onSuccess: () => {
      // setProcessing(false);
    },
    onError: () => {
      setProcessing(false);
    },
  });

  // update coupon info
  const { mutateAsync: updateCouponInfoAsync } = useMutation({
    mutationKey: ["update-coupon-info", bookingInfo?.couponCopied?._id],
    mutationFn: async () => {
      const { data } = await axiosCommon.patch(
        `/update-usage-coupon-info/${bookingInfo?.couponInfo?._id}`,user?.email
      );
      return data;
    },
  });

  const checkOutPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (!bookingInfo?.availability?.stock > bookingInfo?.quantity) {
        toast.error(
          `Only ${bookingInfo?.availability?.stock} items are available in the stock right now!!!`
        );
        return;
      }
      const address = value.label;
      const comment = e.target.comment.value;
      console.log("hit");
      const deliveryPreference = e.target.deliveryPreference.value;
      if (!address) {
        toast.error("Please provide your address");
        return null;
      }

      const deliveryInformation = {
        address,
        comment,
        deliveryPreference,
      };

      console.log(deliveryInformation);

      const { title, brand, category, totalPrice, quantity } = bookingInfo;
      const booking = {
        title,
        brand,
        category,
        originalPrice: bookingInfo?.salePrice ?? bookingInfo?.price,
        price: totalPrice,
        quantity,
        selectedImage: bookingInfo?.selectedImage,
        selectedColor: bookingInfo?.selectedColor,
        productBookingId: bookingInfo?._id,
        sold_count: bookingInfo?.sold_count + bookingInfo?.quantity,
        date: new Date(),
        user: {
          email: user?.email,
          name: user?.displayName,
          photoURL: user?.photoURL,
        },
        seller: bookingInfo?.seller,
        deliveryStatus: "Pending",
        deliveryInformation,
      };
      console.log(booking);

      const data = await paymentAsync(booking);
      console.log(data?.url);
      window.location.href = data?.url;
      setProcessing(false);
      // update coupon info
      if (couponCopied) {
        updateCouponInfoAsync();
      }
      console.log(booking);
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  const inTotalPrice = useMemo(() => {
    if (couponCopied) {
      return Number(
        (
          bookingInfo?.totalPrice *
            (bookingInfo?.couponInfo?.discountValue / 100) || ""
        ).toFixed(2)
      );
    } else {
      return Number(bookingInfo?.totalPrice.toFixed(2));
    }
  }, [couponCopied]);

  console.log({ inTotalPrice });

  console.log(bookingInfo);

  if (userSubscriptionLoading) return <LoadingSpinner />;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-2 text-left align-middle shadow-xl transition-all">
                <div className="p-6 flex flex-col max-h-[90vh]">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium text-center leading-6 text-gray-900"
                  >
                    Review Info Before Reserve
                  </DialogTitle>
                  <div className="mt-2 flex-1 overflow-y-auto">
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Product: {bookingInfo?.title}
                      </p>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">
                        {/* Location: {bookingInfo?.location} */}
                        Check your location before purchasing:
                        <GooglePlacesAutocomplete
                          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                          selectProps={{
                            value,
                            onChange: setValue,
                            placeholder: "Start typing your address...",
                            styles: {
                              control: (base) => ({
                                ...base,
                                borderColor: "#ccc",
                                borderRadius: "8px",
                                padding: "2px",
                                margin: "4px 0px",
                              }),
                            },
                          }}
                        />
                        {value && (
                          <div className="mt-4 p-3 bg-gray-100 rounded">
                            <p className="text-sm">
                              Current delivery location: {value.label}
                            </p>
                          </div>
                        )}
                      </div>
                      <form onSubmit={checkOutPayment}>
                        <Field>
                          <Label className="text-sm/6 font-medium text-white">
                            Delivery preference
                          </Label>
                          <Description className="text-sm/6 text-gray-500">
                            Tell us how you'd like your order delivered.
                          </Description>
                          <div className="relative">
                            <Select
                              required
                              name="deliveryPreference"
                              className={clsx(
                                "mt-3 block w-full appearance-none rounded-lg border-none bg-black px-3 py-1.5 text-sm/6 text-white",
                                "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                                // Force black text for dropdown options
                                "[&_option]:text-white"
                              )}
                              defaultValue="Leave at my door"
                            >
                              <option>Leave at my door</option>
                              <option>Hand it to me directly</option>
                            </Select>
                            <IoChevronDownCircleOutline
                              className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60 text-white"
                              aria-hidden="true"
                            />
                          </div>
                        </Field>
                        <Field className={`mt-3`}>
                          <Label className="text-sm/6 font-medium text-gray-800">
                            Delivery notes
                          </Label>
                          <Description className="text-sm/6 text-gray-500">
                            Do you need let us know anything?
                          </Description>
                          <Textarea
                            name="comment"
                            rows={3}
                            className={clsx(
                              "mt-3 block w-full resize-none rounded-lg border-none bg-black px-3 py-1.5 text-sm/6 text-white",
                              "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                            )}
                          />
                        </Field>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            User: {user?.displayName}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Price: ${bookingInfo?.totalPrice}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Delivery Fee: $
                            {subscription?.hasSubscription ? 0 : 7.49}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Total: $
                            {subscription?.hasSubscription &&
                            couponCopied &&
                            bookingInfo?.couponInfo?.isActive
                              ? Number(inTotalPrice.toFixed(2)) 
                              : subscription?.hasSubscription ? Number(bookingInfo?.totalPrice.toFixed(2)):Number((bookingInfo?.totalPrice + 7.49).toFixed(2)) }
                          </p>
                        </div>
                        {/* apply coupon */}
                        {subscription?.hasSubscription &&
                          bookingInfo?.couponInfo?.isActive && (
                            <>
                              <div className="flex items-center justify-between text-xs bg-gray-100 p-3 rounded-md">
                                <span className="text-gray-700">
                                  Coupon (for subscribers only):
                                  <br />
                                  <span className="font-mono text-sm font-bold">
                                    {bookingInfo?.couponInfo?.code}
                                  </span>
                                </span>
                                <button
                                  onClick={handleCouponCopy}
                                  type="button"
                                  disabled={couponCopied}
                                  className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer disabled:text-gray-400"
                                >
                                  {couponCopied ? (
                                    <FaSquareCheck />
                                  ) : (
                                    <MdCheckBoxOutlineBlank size={16} />
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        <hr className="mt-2 text-gray-200" />
                        {/* Copy Test Card Info */}
                        <div className="flex items-center justify-between text-xs bg-gray-100 p-3 rounded-md">
                          <span className="text-gray-700">
                            For testing, use this card number:
                            <br />
                            <span className="font-mono text-sm">
                              4242 4242 4242 4242
                            </span>
                          </span>
                          <button
                            onClick={handleCopy}
                            type="button"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            {copied ? (
                              <IoMdCheckmark />
                            ) : (
                              <TiClipboard size={16} />
                            )}
                          </button>
                        </div>{" "}
                        {/* checkout button */}
                        <div className="mt-2">
                          <button
                            type="submit"
                            className="btn w-full bg-green-700 text-white"
                          >
                            Checkout
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={closeModal}
                        className="btn w-full bg-red-600 text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    {/* checkout form */}
                    {/*                     <Elements stripe={stripePromise}>
                      <CheckOutForm
                        closeModal={closeModal}
                        bookingInfo={bookingInfo}
                        value={value?.label}
                        refetch={refetch}
                        comment={comment}
                        deliveryPreference={deliveryPreference}
                      />
                    </Elements> */}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

BookingModal.propTypes = {
  bookingInfo: PropTypes.object,
  closeModal: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default BookingModal;
