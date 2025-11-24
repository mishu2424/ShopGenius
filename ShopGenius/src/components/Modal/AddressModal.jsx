import {
  Description,
  Dialog,
  DialogPanel,
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
  Select,
  Textarea,
} from "@headlessui/react";
import clsx from "clsx";
import { IoChevronDownCircleOutline } from "react-icons/io5";
import useMyLocation from "../../hooks/useMyLocation";
import { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { FaSpinner } from "react-icons/fa6";

const AddressModal = ({
  isOpen,
  setIsOpen,
  handleCheckOut,
  totalPrice,
  processing,
  loc,
  setLoc,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      {/* Centering wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-xl bg-black backdrop-blur px-4">
          <form onSubmit={handleCheckOut}>
            <Fieldset className="space-y-6 rounded-xl bg-black p-6 sm:p-10">
              <Legend className="text-base/7 font-semibold text-white">
                Shipping details
              </Legend>

              <Field>
                <Label className="text-sm/6 font-medium text-white">
                  Street address
                </Label>
                {/* <Input
                required
                defaultValue={loc || ""}
                className={clsx(
                  "mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                  "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                )}
              /> */}
                <GooglePlacesAutocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                  selectProps={{
                    loc,
                    onChange: setLoc,
                    placeholder:
                      "Start typing your address if the current location is not yours...",
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
                {loc && (
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <p className="text-sm">
                      {" "}
                      <span className="font-bold text-xs">
                        Current delivery location:
                      </span>{" "}
                      {loc?.label}
                    </p>
                  </div>
                )}
              </Field>

              <Field>
                <Label className="text-sm/6 font-medium text-white">
                  Delivery preference
                </Label>
                <Description className="text-sm/6 text-white/50">
                  Tell us how you'd like your order delivered.
                </Description>
                <div className="relative">
                  <Select
                    required
                    name="deliveryPreference"
                    className={clsx(
                      "mt-3 block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                      "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                      // Force black text for dropdown options
                      "[&_option]:text-black"
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

              <Field>
                <Label className="text-sm/6 font-medium text-white">
                  Delivery notes
                </Label>
                <Description className="text-sm/6 text-white/50">
                  Do you need let us know anything?
                </Description>
                <Textarea
                  name="comment"
                  rows={3}
                  className={clsx(
                    "mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                    "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                  )}
                />
              </Field>

              <button
                disabled={processing}
                className="btn w-full bg-white rounded"
                type="submit"
              >
                {processing ? (
                  <span>
                    <FaSpinner className="m-auto animate-spin" />
                  </span>
                ) : (
                  `Pay $${Number(totalPrice.toFixed(2))}`
                )}
              </button>
            </Fieldset>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddressModal;
