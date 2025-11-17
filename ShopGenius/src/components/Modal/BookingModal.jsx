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
import { Fragment, useEffect } from "react";
import CheckOutForm from "../Form/CheckOutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import copy from "copy-to-clipboard";
import { TiClipboard } from "react-icons/ti";
import { IoMdCheckmark } from "react-icons/io";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import clsx from "clsx";

import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import useMyLocation from "../../hooks/useMyLocation";
import { IoChevronDownCircleOutline } from "react-icons/io5";
import useSubscription from "../../hooks/useSubscription";
import LoadingSpinner from "../Shared/LoadingSpinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BookingModal = ({ closeModal, isOpen, bookingInfo, refetch }) => {
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");
  const [deliveryPreference, setDeliveryPreference] =
    useState("Leave at my door");
  const { location, getLocation } = useMyLocation();
  const [value, setValue] = useState(location?.address || null);
  // console.log(bookingInfo);
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

  if (userSubscriptionLoading) return <LoadingSpinner />;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium text-center leading-6 text-gray-900"
                >
                  Review Info Before Reserve
                </DialogTitle>
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
                        onChange={(e) => setDeliveryPreference(e.target.value)}
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
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className={clsx(
                        "mt-3 block w-full resize-none rounded-lg border-none bg-black px-3 py-1.5 text-sm/6 text-white",
                        "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                      )}
                    />
                  </Field>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    User: {user?.displayName}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {/* From: {format(new Date(bookingInfo?.from), "PP")} - To:{" "}
                    {format(new Date(bookingInfo?.to), "PP")} */}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Price: ${bookingInfo?.totalPrice}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Delivery Fee: ${subscription?.hasSubscription ? 0 : 7.49}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Total: $
                    {subscription?.hasSubscription
                      ? bookingInfo?.totalPrice
                      : Number(bookingInfo?.totalPrice) + 7.49}
                  </p>
                </div>

                {/* apply coupon */}
                <div className="mt-2 flex items-center justify-between">
                 <input type="text" placeholder="Apply coupon" className="input input-bordered" />
                 <button className="btn bg-amber-500 text-white">Apply</button>
                </div>
                <hr className="mt-8 text-gray-200" />
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
                    {copied ? <IoMdCheckmark /> : <TiClipboard size={16} />}
                  </button>
                </div>{" "}
                {/* checkout form */}
                <Elements stripe={stripePromise}>
                  <CheckOutForm
                    closeModal={closeModal}
                    bookingInfo={bookingInfo}
                    value={value?.label}
                    refetch={refetch}
                    comment={comment}
                    deliveryPreference={deliveryPreference}
                  />
                </Elements>
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
