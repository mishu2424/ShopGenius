import React from "react";
import { ShoppingCart, Star } from "lucide-react";
import useSubscription from "../../../hooks/useSubscription";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";
import useAuth from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const [, , , refetch] = useCart();
  const navigate = useNavigate();

  const prod = product;

  // Calculate discount percentage
  const discountPercent = prod.discount?.active
    ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100)
    : 0;

  // Format price per unit (example for 30ml serum)
  const pricePerUnit = (prod.salePrice / 30).toFixed(2);

  const [subscription, userSubscriptionLoading] = useSubscription();

  const { mutateAsync: cartMutateAsync } = useMutation({
    mutationKey: ["user-cart"],
    mutationFn: async (cart) => {
      const { data } = await axiosSecure.post("/cart", { cart });
      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddToCart = async () => {
    if (user && user?.email) {
      if (user?.email === product?.seller?.email) {
        return toast.error("You can not save your own product in the cart");
      }
      const cart = {
        ...product,
        source: "Product-details",
        productBookingId: product?._id,
        selectedColor: prod.colors[0]?.colorCode ?? prod.colors[1]?.colorCode,
        selectedImage: prod.colors[0]?.image[0] ?? prod.colors[1]?.image[0],
        quantity: 1,
        totalPrice: product.discount?.active
          ? product?.salePrice
          : product?.price,
        userInfo: {
          name: user?.displayName || "unknown",
          email: user?.email,
          photoURL: user?.photoURL,
        },
      };
      console.log(cart);
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
      navigate("/login", { state: { from: location }, replace: false });
    }
  };

  if (userSubscriptionLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200 max-w-xs flex flex-col">
      {/* Product Image */}
      <div className="relative mb-3">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {prod.colors?.length > 0 ? (
            <img
              src={prod.colors[0]?.image[0]}
              alt={prod.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
              <svg
                className="w-24 h-24 text-purple-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
          )}
        </div>

        {/* Deal Badge */}
        {prod.discount?.active && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            Deal selling fast
          </div>
        )}
      </div>

      {/* Product Title */}
      <Link to={`/product/${product?._id}`}>
        <h3 className="text-sm leading-tight mb-2 line-clamp-2 hover:text-orange-700 cursor-pointer">
          {prod.title}
        </h3>
      </Link>

      {/* Discount Badge */}
      {prod.discount?.active && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-700 font-bold text-lg">
            -{discountPercent}%
          </span>
          <span className="text-2xl font-bold">
            ${prod.salePrice.toFixed(2)}
          </span>
        </div>
      )}

      {/* Original Price */}
      {prod.discount?.active && (
        <div className="text-xs text-gray-600 mb-2">
          Was: <span className="line-through">${prod.price.toFixed(2)}</span> ($
          {pricePerUnit}/ml)
        </div>
      )}

      {/* Free Delivery */}
      <div className="text-xs text-gray-700 mb-2">
        {subscription?.hasSubscription ? "FREE delivery" : ""}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < prod.rating
                  ? "fill-orange-400 text-orange-400"
                  : "fill-gray-200 text-gray-200"
              }
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">
          ({prod.sold_count.toLocaleString()})
        </span>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="mt-auto cursor-pointer w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-4 rounded-full transition-colors duration-200 text-sm flex items-center justify-center gap-2"
      >
        <ShoppingCart size={16} />
        Add to Cart
      </button>

      {/* Stock Status */}
      {prod.availability.stock < 50 && (
        <div className="mt-2 text-xs text-orange-700">
          Only {prod.availability.stock} left in stock
        </div>
      )}
    </div>
  );
}
