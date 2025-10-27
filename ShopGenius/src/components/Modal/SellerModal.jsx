import PropTypes from "prop-types";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import { Fragment } from "react";
import { FaCrown } from "react-icons/fa";

const SellerModal = ({ closeModal, isOpen, handleHostRequest }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        {/* Background Blur */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-90 translate-y-4"
          >
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white/90 backdrop-blur-lg border border-gray-100 shadow-2xl p-8 text-center transition-all">
              {/* Icon Header */}
              <div className="flex flex-col items-center space-y-3">
                {/* <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 text-white p-4 rounded-full shadow-md">
                  <FaCrown className="text-3xl" />
                </div> */}
                <DialogTitle
                  as="h3"
                  className="text-2xl font-semibold text-gray-800"
                >
                  Become a Seller 👑
                </DialogTitle>
                <p className="text-sm text-gray-500 max-w-sm">
                  Join our trusted seller community and grow your business on{" "}
                  <span className="font-medium text-blue-600">ShopGenius</span>.
                  Please review all seller guidelines before proceeding.
                </p>
              </div>

              {/* Divider */}
              <div className="mt-6 border-t border-gray-200"></div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleHostRequest}
                  type="button"
                  className="cursor-pointer px-6 py-2.5 text-sm font-medium text-white rounded-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow hover:shadow-lg transition-all duration-300"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

SellerModal.propTypes = {
  closeModal: PropTypes.func,
  isOpen: PropTypes.bool,
  handleHostRequest: PropTypes.func,
};

export default SellerModal;
