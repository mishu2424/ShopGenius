import PropTypes from "prop-types";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment } from "react";
import UpdateProductForm from "../Form/UpdateProductForm";

const UpdateProductModal = ({
  setIsEditModalOpen,
  isOpen,
  product,
  handleUpdateProduct,
  onSale,
  setOnSale,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  colors,
  setColors,
  loading,
  setLoading,
  handleColorChange,
  handleAddColor,
  handleColorImages,
  handleRemoveColor,
  salePreview
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsEditModalOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium text-center leading-6 text-gray-900 my-3"
                >
                  Update Product Info
                </DialogTitle>
                <div className="max-h-[75vh] overflow-y-auto pr-2">
                  <UpdateProductForm
                    product={product}
                    handleUpdateProduct={handleUpdateProduct}
                    onSale={onSale}
                    setOnSale={setOnSale}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    discountValue={discountValue}
                    setDiscountValue={setDiscountValue}
                    colors={colors}
                    setColors={setColors}
                    loading={loading}
                    setLoading={setLoading}
                    handleColorChange={handleColorChange}
                    handleAddColor={handleAddColor}
                    handleColorImages={handleColorImages}
                    handleRemoveColor={handleRemoveColor}
                    salePreview={salePreview}
                    setIsEditModalOpen={setIsEditModalOpen}
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

UpdateProductModal.propTypes = {
  setIsEditModalOpen: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default UpdateProductModal;
