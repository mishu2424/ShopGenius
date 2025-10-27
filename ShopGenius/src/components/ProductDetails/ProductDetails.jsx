import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useAxiosCommon from "../../hooks/useAxiosCommon";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { FaMinus, FaPlus } from "react-icons/fa6";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import useCart from "../../hooks/useCart";
import { Helmet } from "react-helmet-async";
import BookingModal from "../Modal/BookingModal";

const ProductDetails = () => {
  const axiosCommon = useAxiosCommon();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const [, , refetch] = useCart();
  const { id } = useParams();
  const location = useLocation();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const openModal = () => {
    if (!user?.email) {
      // redirect to login and remember where user came from
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }
    setIsBookingModalOpen(true);
  };
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const { data: product, isLoading, refetch:productDataRefech } = useQuery({
    queryKey: ["product-details", id],
    queryFn: async () => {
      const { data } = await axiosCommon(`/product/details/${id}`);
      return data;
    },
  });

  const [colorIndex, setColorIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const currency = product?.currency || "CAD";
  const fmt = useMemo(
    () => new Intl.NumberFormat("en-CA", { style: "currency", currency }),
    [currency]
  );

  // derive view state safely
  const selectedColor = product?.colors?.[colorIndex];
  const images = selectedColor?.image ?? [];
  const currentImg = images?.[imageIndex] ?? images?.[0];

  // price for ONE unit “right now”
  const priceNow = useMemo(() => {
    if (!product) return 0;
    return product?.discount?.active && product?.salePrice
      ? Number(product.salePrice)
      : Number(product?.price || 0);
  }, [product]);

  // total = unit * quantity
  const totalPrice = useMemo(
    () => Number((priceNow * quantity).toFixed(2)),
    [priceNow, quantity]
  );

  console.log(totalPrice, quantity);

  const { mutateAsync: cartMutateAsync } = useMutation({
    mutationKey: ["user-cart"],
    mutationFn: async (cart) => {
      const { data } = await axiosSecure.post("/cart", cart);
      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddToCart = async () => {
    console.log(totalPrice);
    if (user && user?.email) {
      if(user?.email===product?.seller?.email){
        return toast.error("You can not save your own product in the cart")
      }
      const cart = {
        ...product,
        source:"Product-details",
        productBookingId: product?._id,
        selectedColor: selectedColor?.name,
        selectedImage: currentImg,
        quantity,
        totalPrice,
        userInfo: {
          name: user?.displayName || "unknown",
          email: user?.email,
        },
        // productId: product?._id,
        // orderQuantity: quantity,
        // img: currentImg,
        // title: product?.title,
        // brand: product?.brand,
        // description: product?.description,
        // category: product?.category,
        // price: Number(priceNow * quantity),
        // rating: product?.rating,
        // discount: product?.discount,
        // availability: product?.availability,
        // seller: product?.seller,
        // userInfo: {
        //   name: user?.displayName || "unknown",
        //   email: user?.email,
        // },
      };
      delete cart?._id;
      try {
        const data = await cartMutateAsync(cart);
        if (data.insertedId) {
          toast.success(`Item has been added to cart`);
        } else {
          toast(`${data?.message}!`, {
            icon: "🛒",
          });
        }
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      navigate("/login");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product)
    return (
      <div className="p-8 text-center text-gray-600">Product not found.</div>
    );

  return (
    <>
      <Helmet>
        <title>{`ShopGenius | Product-${id}`}</title>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to={"/"}>
            <span className="capitalize hover:underline cursor-pointer">
              Home
            </span>
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-800">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Gallery */}
          <section className="grid grid-cols-[70px_1fr] gap-3">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-2 order-2 lg:order-1">
              {images?.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={`w-[70px] h-[70px] cursor-pointer border rounded overflow-hidden ${
                    imageIndex === idx
                      ? "ring-2 ring-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={src}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="order-1 lg:order-2 bg-white border border-gray-200 rounded p-3 flex items-center justify-center">
              {currentImg ? (
                <img
                  src={currentImg}
                  alt={product?.title}
                  className="max-h-[520px] w-full object-contain"
                />
              ) : (
                <div className="h-[420px] w-full grid place-items-center text-gray-400">
                  No image
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: Details */}
          <section className="space-y-5">
            {/* Title / brand / rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {product.title}
              </h1>
              {product.brand && (
                <p className="mt-1 text-sm text-gray-600">
                  Brand:{" "}
                  <span className="text-gray-800 font-medium">
                    {product.brand}
                  </span>
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 20 20"
                      className={`w-4 h-4 ${
                        i < (product.rating ?? 0)
                          ? "fill-yellow-400"
                          : "fill-gray-300"
                      }`}
                    >
                      <path d="M10 1.5l2.69 5.45 6.01.87-4.35 4.24 1.03 6.01L10 15.86l-5.38 2.83 1.03-6.01L1.3 7.82l6.01-.87L10 1.5z" />
                    </svg>
                  ))}
                </div>
                <span>{product.sold_count?.toLocaleString()} sold</span>
                {product.popular && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-3 text-gray-700">{product.description}</p>
            </div>

            {/* Price */}
            <div className="space-y-1">
              {product?.discount?.active && product.salePrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-[#B12704]">
                    {fmt.format(totalPrice)}
                  </span>
                  <span className="text-sm line-through text-gray-500">
                    {fmt.format(product.price)}
                  </span>
                  <span className="text-sm text-green-700">
                    You save {fmt.format(product.price - product.salePrice)}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-gray-900">
                    <span className="text-3xl font-semibold text-gray-900">
                      {fmt.format(totalPrice)}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">({currency})</span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                All prices include taxes where applicable.
              </p>
            </div>

            {/* Color selector */}
            {!!product.colors?.length && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Color:{" "}
                  <span className="font-semibold">{selectedColor?.name}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setColorIndex(idx);
                        setImageIndex(0);
                      }}
                      className={`inline-flex cursor-pointer items-center gap-2 px-2.5 py-1.5 rounded-full border text-sm transition ${
                        idx === colorIndex
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      title={c.name}
                    >
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: c.colorCode }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability & Seller */}
            <div className="space-y-1 text-sm">
              <p
                className={`${
                  product.availability?.status === "in_stock" &&
                  product.availability?.stock > 0
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {product.availability?.status === "in_stock"
                  ? `In Stock (${product.availability?.stock} available)`
                  : "Out of Stock"}
              </p>
              {product.seller && (
                <p className="text-gray-600">
                  Sold by{" "}
                  <span className="font-medium text-gray-800">
                    {product?.seller?.storeName}
                  </span>{" "}
                  — {product?.seller?.location}
                </p>
              )}
            </div>

            <div className="my-4">
              <button className="btn border border-gray-300">
                <span
                  onClick={() => {
                    setQuantity(quantity + 1);
                  }}
                  className="btn-sm text-xl cursor-pointer"
                >
                  <FaPlus />
                </span>
                Quantity {quantity}
                <span
                  onClick={() => {
                    if (quantity > 1) {
                      setQuantity(quantity - 1);
                    }
                  }}
                  className="btn-sm text-xl cursor-pointer"
                >
                  <FaMinus />
                </span>
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
              <button
                onClick={handleAddToCart}
                className="btn cursor-pointer col-span-2 sm:col-span-1 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium px-6 py-3 transition shadow"
              >
                Add to Cart
              </button>
              <button
                onClick={openModal}
                className="btn cursor-pointer col-span-2 sm:col-span-1 rounded-full bg-[#2381D3] hover:bg-blue-700 text-white font-medium px-6 py-3 transition shadow"
              >
                Buy Now
              </button>
              <BookingModal
                closeModal={closeBookingModal}
                isOpen={isBookingModalOpen}
                bookingInfo={{
                  ...product,
                  selectedColor: selectedColor?.name,
                  selectedImage: currentImg,
                  quantity,
                  totalPrice,
                }}
                refetch={productDataRefech}
              />
            </div>

            {/* Meta */}
            <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
              <li>
                Category:{" "}
                <span className="capitalize text-gray-800 font-medium">
                  {product?.category}
                </span>
              </li>
              {product?.targetGender !== "none" && (
                <li>
                  For:{" "}
                  <span className="capitalize text-gray-800 font-medium">
                    {product?.targetGender}
                  </span>
                </li>
              )}
              <li>Returns: 30-day return policy</li>
              <li>Shipping: Standard (3–5 business days)</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
