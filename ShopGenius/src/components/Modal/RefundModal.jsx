import { Fragment, useState } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { IoIosCheckmarkCircle } from "react-icons/io";
import { PiCaretCircleUpDown } from "react-icons/pi";
import { HiOutlineXMark } from "react-icons/hi2";

const RefundModal = ({ order, isOpen, closeModal, refundMoney }) => {
  const [refundStatus, setRefundStatus] = useState(
    order?.refundStatus ? 'true' : 'false'
  );

  const isAlreadyRefunded = order?.refundStatus === true;

  const refundOptions = [
    { value: 'true', label: 'Approve Refund', disabled: isAlreadyRefunded },
    { value: 'false', label: 'Deny Refund', disabled: false },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    refundMoney(refundStatus);
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Scrollable Content Container */}
                <div className="max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    {/* Close button - Fixed position within modal */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 z-10"
                    >
                      <HiOutlineXMark className="h-6 w-6" />
                    </button>

                    {/* Modal Title */}
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4 pr-8"
                    >
                      Process Refund Request
                    </Dialog.Title>

                    {/* Order Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Order: {order?.title}</p>
                      <p className="text-sm text-gray-600">
                        Amount: ${order?.totalPrice}
                      </p>
                      <p className="text-sm text-gray-600">
                        Current Status:{' '}
                        <span
                          className={`font-semibold ${
                            order?.refundStatus
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {order?.refundStatus ? 'Refunded' : 'Not Refunded'}
                        </span>
                      </p>
                      {isAlreadyRefunded && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⚠️ This order has already been refunded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      {/* Listbox Dropdown */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Refund Decision
                        </label>
                        <Listbox 
                          disabled={isAlreadyRefunded} 
                          value={refundStatus} 
                          onChange={setRefundStatus}
                        >
                          <div className="relative mt-1">
                            <Listbox.Button 
                              className={`relative w-full cursor-pointer rounded-lg bg-white py-3 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isAlreadyRefunded ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <span className="block truncate">
                                {refundOptions.find((opt) => opt.value === refundStatus)
                                  ?.label || 'Select refund status'}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <PiCaretCircleUpDown
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </span>
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                {refundOptions.map((option) => (
                                  <Listbox.Option
                                    key={option.value}
                                    className={({ active }) =>
                                      `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                        active
                                          ? 'bg-blue-100 text-blue-900'
                                          : 'text-gray-900'
                                      } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                                    }
                                    value={option.value}
                                    disabled={option.disabled}
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span
                                          className={`block truncate ${
                                            selected ? 'font-medium' : 'font-normal'
                                          }`}
                                        >
                                          {option.label}
                                        </span>
                                        {selected ? (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                            <IoIosCheckmarkCircle
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isAlreadyRefunded}
                          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isAlreadyRefunded
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isAlreadyRefunded ? 'Already Refunded' : 'Process Refund'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RefundModal;