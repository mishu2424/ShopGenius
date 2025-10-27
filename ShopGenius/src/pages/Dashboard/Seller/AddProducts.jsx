import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { ImageBBUpload } from "../../../api/utilities";
import useAuth from "../../../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { Helmet } from "react-helmet-async";

const AddProduct = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // sale controls
  const [onSale, setOnSale] = useState(false);
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" | "flat"
  const [discountValue, setDiscountValue] = useState(""); // string for input control

  // colors control
  const [colors, setColors] = useState([
    { name: "", colorCode: "#FFFFFF", images: [], previews: [] },
  ]);

  // Handle color name/code change
  const handleColorChange = (index, key, value) => {
    const updated = [...colors];
    // console.log(updated);
    updated[index][key] = value;
    // console.log(updated);
    setColors(updated);
  };

  // Handle image upload per color
  const handleColorImages = (index, files) => {
    const updated = [...colors];
    updated[index].images = Array.from(files);
    // console.log(Array.from(files));
    updated[index].previews = Array.from(files).map((f) =>
      URL.createObjectURL(f)
    );
    setColors(updated);
  };

  // Add another color section
  const handleAddColor = () => {
    setColors([
      ...colors,
      { name: "", colorCode: "#FFFFFF", images: [], previews: [] },
    ]);
  };

  // Remove color section
  const handleRemoveColor = (index) => {
    const updated = [...colors];
    updated.splice(index, 1);
    setColors(updated);
  };

  const { mutateAsync: addProductAsync, isPending } = useMutation({
    mutationKey: ["add-product"],
    mutationFn: async (product) => {
      const { data } = await axiosSecure.post(`/products`, product);
      return data;
    },
  });

  // Live sale price preview (based on entered price in the form)
  const salePreview = useMemo(() => {
    // we need price + discountType + discountValue; we only have discount here.
    // For preview we’ll read the current "price" input directly when available.
    const priceInput = document.querySelector('input[name="price"]');
    const rawPrice = priceInput ? parseFloat(priceInput.value) : NaN;
    const value = parseFloat(discountValue);

    if (!onSale || Number.isNaN(rawPrice) || Number.isNaN(value)) return null;

    let calc = rawPrice;
    if (discountType === "percentage") {
      calc = rawPrice * (1 - value / 100);
    } else {
      calc = rawPrice - value;
    }
    // clamp at 0
    const finalPrice = Math.max(0, Number(calc.toFixed(2)));
    return finalPrice;
  }, [onSale, discountType, discountValue]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.target);
      const productId = form.get("productId");
      const title = form.get("title");
      const brand = form.get("brand");
      const description = form.get("description");
      const category = form.get("category");
      const targetGender = form.get("targetGender");
      const price = parseFloat(form.get("price"));
      const currency = "CAD";
      const stockStatus = form.get("available"); // "in_stock" | "low_stock" | "out_of_stock"
      const stock = parseInt(form.get("stock"));
      const sellerName = form.get("name");
      const storeName = form.get("storeName");
      const location = form.get("location");

      if (Number.isNaN(price) || price < 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      // Validate discount if onSale
      let computedSalePrice = price;
      let discountObj = {
        active: false,
        type: null,
        value: null,
        discountPercentage: null,
      };

      if (onSale) {
        const dv = parseFloat(discountValue);
        if (Number.isNaN(dv) || dv < 0) {
          toast.error("Please enter a valid discount value.");
          return;
        }
        if (discountType === "percentage") {
          computedSalePrice = price * (1 - dv / 100);
        } else {
          computedSalePrice = price - dv;
        }
        // clamp
        computedSalePrice = Math.max(0, Number(computedSalePrice.toFixed(2)));

        discountObj = {
          active: true,
          type: discountType, // "percentage" | "flat"
          value: dv, // the actual number (e.g. 5 or 50)
          discountPercentage: discountType === "percentage" ? dv : null,
        };
      }

      // available is true unless explicitly out_of_stock
      const available = stockStatus !== "out_of_stock";

      // Upload each color’s images
      const uploadedColors = await Promise.all(
        colors.map(async (c) => {
          const uploaded = await Promise.all(
            c.images.map((img) => ImageBBUpload(img))
          );
          return { name: c.name, colorCode: c.colorCode, image: uploaded };
        })
      );

      const newProduct = {
        productId,
        title,
        brand,
        description,
        category: category.toLowerCase(),
        targetGender,
        price,
        currency,
        discount: discountObj, // 👈 updated discount shape
        salePrice: computedSalePrice, // 👈 kept separate
        colors: uploadedColors,
        availability: {
          available, // boolean
          status: stockStatus, // "in_stock" | "low_stock" | "out_of_stock"
          stock,
        },
        rating: 0,
        sold_count: 0,
        popular: false,
        seller: { name: sellerName, email: user?.email, storeName, location },
        new: true,
      };

      const data = await addProductAsync(newProduct);

      if (data?.insertedId) {
        toast.success("✅ Product added successfully!");
        e.target.reset();
        setColors([
          { name: "", colorCode: "#FFFFFF", images: [], previews: [] },
        ]);
        setOnSale(false);
        setDiscountType("percentage");
        setDiscountValue("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Add Products | ShopGenius</title>
      </Helmet>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 my-10">
        <h2 className="text-2xl font-bold text-center mb-5 text-gray-700">
          Add New Product
        </h2>

        <form onSubmit={handleAddProduct} className="space-y-5">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Product Title"
              required
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              required
              className="input input-bordered w-full"
            />
          </div>

          <input
            type="text"
            name="productId"
            placeholder="Product ID"
            required
            className="input input-bordered w-full"
          />

          <textarea
            name="description"
            placeholder="Description"
            rows="3"
            className="textarea textarea-bordered w-full"
            required
          ></textarea>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="category"
              placeholder="Category (e.g. beauty)"
              required
              className="input input-bordered w-full"
            />
            <select
              name="targetGender"
              className="select select-bordered w-full"
              required
            >
              <option value="">Target Gender</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="price"
              step="0.01"
              placeholder="Price"
              required
              className="input input-bordered w-full"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock Quantity"
              required
              className="input input-bordered w-full"
            />
            <select
              name="available"
              className="select select-bordered w-full"
              required
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* On Sale */}
          <div>
            <p className="text-gray-700 font-medium mb-2">
              Is this product on sale?
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="onSale"
                  value="true"
                  checked={onSale}
                  onChange={() => setOnSale(true)}
                  className="radio radio-sm"
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
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
                <select
                  className="select select-bordered w-full"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  {/* <option value="flat">Flat Amount ($)</option> */}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={
                    "Discount value (e.g., 5 for 5%)"
                    // discountType === "percentage"
                    //   ? "Discount value (e.g., 5 for 5%)"
                    //   : "Discount amount (e.g., 10 for $10)"
                  }
                  className="input input-bordered w-full"
                />
                {salePreview !== null && (
                  <div className="md:col-span-2 text-sm text-green-700">
                    Estimated sale price:{" "}
                    <span className="font-semibold">${salePreview}</span>
                  </div>
                )}
              </div>
            )}
          </div>

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
                  <input
                    type="text"
                    placeholder="Color Name (e.g. White)"
                    value={color.name}
                    onChange={(e) =>
                      handleColorChange(index, "name", e.target.value)
                    }
                    className="input input-bordered w-full"
                    required
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Pick Color:</span>
                    <input
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

                <input
                  type="file"
                  multiple
                  required
                  accept="image/*"
                  onChange={(e) => handleColorImages(index, e.target.files)}
                  className="file-input file-input-bordered w-full"
                />

                {color.previews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {color.previews.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
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
          <input
            type="text"
            name="name"
            placeholder="Seller Name"
            required
            className="input input-bordered w-full"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="storeName"
              placeholder="Store Name"
              required
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (e.g. Toronto, ON)"
              required
              className="input input-bordered w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn bg-[#2381D3] hover:bg-[#105a9b] text-white w-full mt-4"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddProduct;
