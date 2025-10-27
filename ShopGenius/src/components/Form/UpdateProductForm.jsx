import React from "react";
import { FaSpinner } from "react-icons/fa6";

const UpdateProductForm = ({
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
  salePreview,
  setIsEditModalOpen,
}) => {
  return (
    <div
      data-lenis-prevent
      className="min-h-[80vh] overflow-y-auto overscroll-contain pr-2"
    >
      <form onSubmit={handleUpdateProduct} className="space-y-5">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              required
              defaultValue={product?.title}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Brand
            </label>
            <input
              id="brand"
              type="text"
              name="brand"
              defaultValue={product?.brand}
              required
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="productId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product ID
          </label>
          <input
            id="productId"
            type="text"
            name="productId"
            defaultValue={product?.productId}
            readOnly
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            rows="3"
            className="textarea textarea-bordered w-full"
            required
          ></textarea>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <input
              id="category"
              type="text"
              name="category"
              defaultValue={product?.category}
              required
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="targetGender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Target Gender
            </label>
            <select
              id="targetGender"
              name="targetGender"
              className="select select-bordered w-full"
              required
              defaultValue={product?.targetGender}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              name="price"
              step="0.01"
              defaultValue={product?.price}
              required
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stock Quantity
            </label>
            <input
              id="stock"
              type="number"
              name="stock"
              defaultValue={
                product?.availability?.available && product?.availability?.stock
              }
              required
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="available"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Availability Status
            </label>
            <select
              id="available"
              name="available"
              className="select select-bordered w-full"
              required
              defaultValue={product?.availability?.status}
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* On Sale */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">
            Is this product on sale?
          </legend>
          <div className="flex flex-wrap gap-6 items-center">
            <label htmlFor="onSale-yes" className="flex items-center gap-2">
              <input
                id="onSale-yes"
                type="radio"
                name="onSale"
                value="true"
                checked={onSale}
                onChange={() => setOnSale(true)}
                className="radio radio-sm"
              />
              Yes
            </label>
            <label htmlFor="onSale-no" className="flex items-center gap-2">
              <input
                id="onSale-no"
                type="radio"
                name="onSale"
                value="false"
                checked={!onSale}
                onChange={() => setOnSale(false)}
                className="radio radio-sm"
              />
              No
            </label>
          </div>

          {onSale && (
            <div className="mt-3 grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="discountType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Discount Type
                </label>
                <select
                  id="discountType"
                  className="select select-bordered w-full"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  {/* <option value="flat">Flat Amount ($)</option> */}
                </select>
              </div>

              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Discount Value
                </label>
                <input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.discount?.value}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g., 5 for 5%"
                  className="input input-bordered w-full"
                />
                {salePreview !== null && (
                  <div className="md:col-span-2 text-sm text-green-700">
                    Estimated sale price:{" "}
                    <span className="font-semibold">${salePreview}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </fieldset>

        {/* Colors Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Color Variants
          </h3>

          {colors.map((color, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded-lg mb-3 bg-gray-50"
            >
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label
                    htmlFor={`color-name-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Color Name
                  </label>
                  <input
                    id={`color-name-${index}`}
                    type="text"
                    placeholder="e.g., White"
                    value={color.name}
                    onChange={(e) =>
                      handleColorChange(index, "name", e.target.value)
                    }
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`color-code-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Pick Color
                  </label>
                  <input
                    id={`color-code-${index}`}
                    required
                    type="color"
                    value={color.colorCode}
                    onChange={(e) =>
                      handleColorChange(index, "colorCode", e.target.value)
                    }
                    className="w-12 h-10 rounded-md border cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`color-files-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Upload Images
                </label>
                <input
                  id={`color-files-${index}`}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleColorImages(index, e.target.files)}
                  className="file-input file-input-bordered w-full"
                />
              </div>

              <div className="mt-3">
                {(color?.previews?.length > 0
                  ? color.previews
                  : color.image || []
                )?.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {(color.previews.length > 0
                      ? color.previews
                      : color.image
                    ).map((src, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={src}
                          alt="preview"
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        {color.previews.length > 0 && (
                          <span className="absolute -top-2 -right-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                            new
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {color.previews.length > 0 && (
                <button
                  type="button"
                  className="btn btn-xs mt-2 bg-gray-100 hover:bg-gray-200"
                  onClick={() => {
                    const updated = [...colors];
                    updated[index].previews.forEach((url) =>
                      URL.revokeObjectURL(url)
                    );
                    updated[index].images = [];
                    updated[index].previews = [];
                    setColors(updated);
                  }}
                >
                  Clear new images
                </button>
              )}

              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="btn btn-xs mt-3 bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Remove Color
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddColor}
            className="btn btn-outline btn-sm text-blue-600 border-blue-400 hover:bg-blue-100"
          >
            + Add Another Color
          </button>
        </div>

        {/* Seller Info */}
        <div>
          <label
            htmlFor="sellerName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Seller Name
          </label>
          <input
            id="sellerName"
            type="text"
            name="name"
            defaultValue={product?.seller?.name}
            required
            className="input input-bordered w-full"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="storeName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Store Name
            </label>
            <input
              id="storeName"
              type="text"
              name="storeName"
              defaultValue={product?.seller?.storeName}
              required
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              name="location"
              defaultValue={product?.seller?.location}
              required
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-[#2381D3] hover:bg-[#105a9b] text-white w-full mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              Updating Product...
              <FaSpinner className="animate-spin" />
            </span>
          ) : (
            "Update Product"
          )}{" "}
        </button>
        <div className="">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            onClick={() => setIsEditModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProductForm;
