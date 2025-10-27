import PropTypes from "prop-types";
import { FaStar } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import { Link } from "react-router-dom";
import UpdateProductModal from "../Modal/UpdateProductModal";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ImageBBUpload } from "../../api/utilities";
import useAuth from "../../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import LoadingSpinner from "../Shared/LoadingSpinner";
import DeleteModal from "../Modal/DeleteModal";
const ProductDataRow = ({ product, refetch }) => {
  const { user } = useAuth();
  const [isOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  // sale controls
  const [onSale, setOnSale] = useState(product?.discount?.active);
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" | "flat"
  const [discountValue, setDiscountValue] = useState(
    product?.discount?.value || ""
  ); // string for input control

  // colors control
  // ProductDataRow.jsx
  const [colors, setColors] = useState(
    (product?.colors || []).map((c) => ({
      ...c, // existing: { name, colorCode, image: [url,url] }
      images: [], // new File[] user selects (for upload)
      previews: [], // blob URLs for UI preview
    }))
  );
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
    const fileArr = Array.from(files); // real File objects
    updated[index].images = fileArr; // save Files for upload later
    updated[index].previews = fileArr.map((f) => URL.createObjectURL(f)); // UI only
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

  // update product
  const { mutateAsync: updateProductAsync, isPending } = useMutation({
    mutationKey: ["product-update", user?.email],
    mutationFn: async (updatedProduct) => {
      const { data } = await axiosSecure.patch(
        `/update-product/${product?._id}`,
        updatedProduct
      );
      console.log(data);
      return data;
    },
    onSuccess: () => {
      setLoading(false);
      setIsEditModalOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong!");
      setLoading(false);
    },
  });

  // delete room
  const { mutateAsync: deleteProductAsync, isPending: deleteProductPending } =
    useMutation({
      mutationKey: ["delete-room", user?.email],
      mutationFn: async (reason) => {
        const { data } = await axiosSecure.delete(
          `/delete-room/${product?._id}?reason=${reason}`
        );
        return data;
      },
      onSuccess: () => {
        setLoading(false);
        setIsDeleteModalOpen(false);
        refetch();
      },
      onError: () => {
        toast.success(`Something went wrong!`);
        setLoading(false);
      },
    });

  const handleUpdateProduct = async (e) => {
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
          type: discountType, // "percentage"
          value: dv, // the actual number (e.g. 5 or 50)
          discountPercentage: discountType === "percentage" ? dv : null,
        };
      }

      // available is true unless explicitly out_of_stock
      const available = stockStatus !== "out_of_stock";

      // In your submit handler (where you currently upload)
      const uploadedColors = await Promise.all(
        colors.map(async (c) => {
          if (c.images.length > 0) {
            // user selected new files for this color
            const uploaded = await Promise.all(
              c.images.map((img) => ImageBBUpload(img))
            );
            return { name: c.name, colorCode: c.colorCode, image: uploaded };
          }
          // no new files picked → keep existing image URLs
          return { name: c.name, colorCode: c.colorCode, image: c.image || [] };
        })
      );

      const updatedProduct = {
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
        rating: product?.rating || 0,
        sold_count: product?.sold_count || 0,
        popular: product?.popular || false,
        seller: { name: sellerName, email: user?.email, storeName, location },
        new: product?.new || true,
      };

      // if(updatedProduct){
      //   console.log(updatedProduct);
      //   setLoading(false);
      //   return;
      // }

      const data = await updateProductAsync(updatedProduct);
      console.log(data);
      if (data.modifiedCount > 0) {
        return toast.success("Product Data has been updated");
      } else {
        return toast.success("Product is already up to date!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reason = e?.target?.reason?.value;
      const data = await deleteProductAsync(reason);
      if (data.deletedCount > 0) {
        toast.success(`Product has been deleted!`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isPending || deleteProductPending) return <LoadingSpinner />;
  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="block relative">
              {/* <img
                alt='profile'
                src={product?.image}
                className='mx-auto object-cover rounded h-10 w-15 '
              /> */}
            </div>
          </div>
          <div className="ml-3">
            <Link to={`/product/${product?._id}`}>
              <p className="text-gray-900 whitespace-no-wrap link-hover hover:text-blue-500">
                {product?.title}
              </p>
            </Link>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{product?.brand}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          <span
            className={`${product?.discount?.active && "line-through text-xs"}`}
          >
            ${product?.price}
          </span>{" "}
          {product?.discount?.active && (
            <span className="font-bold text-red-500">
              ${product?.salePrice}
            </span>
          )}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{product?.category}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="whitespace-no-wrap flex items-center text-yellow-500">
          {Array.from({ length: product?.rating }).map((_, i) => (
            <FaStar key={i} />
          ))}
          {product?.rating === 0 && <CiStar />}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
          ></span>
          <span className="relative">Delete</span>
        </button>
        {/* Delete modal */}
        <DeleteModal
          closeDeleteModal={closeDeleteModal}
          isDeleteModalOpen={isDeleteModalOpen}
          loading={loading}
          handleDeleteProduct={handleDeleteProduct}
        />
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
          ></span>
          <span className="relative">Update</span>
        </button>
        {/* Update Modal */}
        <div className="">
          <UpdateProductModal
            isOpen={isOpen}
            setIsEditModalOpen={setIsEditModalOpen}
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
          />
        </div>
      </td>
    </tr>
  );
};

ProductDataRow.propTypes = {
  room: PropTypes.object,
  refetch: PropTypes.func,
};

export default ProductDataRow;
