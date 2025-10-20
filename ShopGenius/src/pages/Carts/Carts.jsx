import { useMutation } from "@tanstack/react-query";
import CartItem from "../../components/Shared/cards/CartItem";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import Title from "../../components/Shared/Title";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCart from "../../hooks/useCart";
import { CiShoppingCart } from "react-icons/ci";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

const Carts = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [carts, isCartLoading, refetch] = useCart();
  const [cartsData, setCartsData] = useState([]);

  useEffect(() => {
    if (carts) setCartsData(carts);
  }, [carts]);

  //   delete from cart
  const { mutateAsync: deleteCartAsync } = useMutation({
    mutationKey: ["cart-delete"],
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/cart/${id}`);
      return data;
    },
    onSuccess: () => {
      refetch();
      navigate(`/carts`);
    },
  });

  const handleRemove = async (id) => {
    try {
      await deleteCartAsync(id);
      toast.success("🗑️ Removed from cart");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  // --- handle quantity change ---
  const handleQuantityChange = (id, newQty) => {
    setCartsData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, orderQuantity: newQty } : item
      )
    );
  };

  if (isCartLoading) return <LoadingSpinner />;

  if (!carts || carts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 text-lg">
        🛒 Your cart is empty.
      </div>
    );
  }

  // ✅ total updates dynamically based on cartsData
  const total = cartsData.reduce(
    (sum, item) => sum + (item?.price || 0) * (item?.orderQuantity || 1),
    0
  );

  return (
    <>
      <Helmet>
        <title>ShopGenius | Carts</title>
      </Helmet>
      <div className="max-w-6xl mx-auto p-6">
        <Title
          title={"Shopping Cart"}
          borderColor={"border-gray-500"}
          icon={CiShoppingCart}
          iconColor={"text-gray-500"}
        />

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          {/* Left: Cart items */}
          <div>
            {carts.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                refetch={refetch}
                handleRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>

          {/* Right: Summary */}
          <div className="bg-gray-50 border rounded-md p-4 h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <p className="text-gray-700 mb-1">
              Subtotal ({carts.length} items):
            </p>
            <p className="text-2xl font-bold text-[#B12704]">
              ${Number(total.toFixed(2))}
            </p>
            <button className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold py-2 rounded-md transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Carts;
