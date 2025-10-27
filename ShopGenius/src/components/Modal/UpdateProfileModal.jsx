import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import PropTypes from "prop-types";
import UpdateProfileForm from "../Form/UpdateProfileForm";
// import UpdateProfileForm from "../Form/UpdateProfileForm";

const UpdateProfileModal = ({
  isOpen,
  setIsOpen,
  handleUpdateProfile,
  handleImagePreview,
  imageFile,
  imageText,
}) => {
  // console.log(isOpen, setIsOpen);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsOpen(false)}
      >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Update User Modal
                </Dialog.Title>
                <div className="mt-2">
                  <UpdateProfileForm
                    handleUpdateProfile={handleUpdateProfile}
                    handleImagePreview={handleImagePreview}
                    imageFile={imageFile}
                    imageText={imageText}
                    setIsOpen={setIsOpen}
                  />
                </div>

                {/* <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

UpdateProfileModal.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  handleUpdateProfile: PropTypes.func,
};
export default UpdateProfileModal;