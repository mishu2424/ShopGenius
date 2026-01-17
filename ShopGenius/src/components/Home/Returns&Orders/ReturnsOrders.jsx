import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Delivery from "../../Shared/Delivery";
import useCart from "../../../hooks/useCart";
import Cart from "./Cart";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import LoadingSpinner from "../../Shared/LoadingSpinner";

const ReturnsOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carts=[], , isCartLoading, refetch] = useCart();
  const [cartsData, setCartsData] = useState([]);

  useEffect(() => {
    if (carts) setCartsData(carts);
  }, [carts]);

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

  const handleToCart = async (cart) => {
    if (user && user?.email) {
      if (user?.email === cartsData?.seller?.email) {
        return toast.error("You can not save your own product in the cart");
      }

      try {
        const data = await cartMutateAsync(cart);
        if (data.modifiedCount) {
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

  // --- handle quantity change ---
  const handleQuantityChange = (id, newQty, cart) => {
    console.log(id, newQty);
    const updatedCart = {
      ...cart,
      cartId: cart?._id,
      source: "returnsOrders",
      quantity: newQty,
    };
    delete updatedCart?._id;
    handleToCart(updatedCart);
  };

  if (isCartLoading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Returns & Orders | ShopGenius</title>
      </Helmet>
      <div>
        <div className="flex flex-col lg:flex-row items-center gap-3 my-2">
          <NavLink
            to="/returns&orders"
            end
            className={({ isActive, isPending }) =>
              `relative px-8 text-sm transition-all ${
                isPending
                  ? "pending"
                  : isActive
                  ? "text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[4px] after:bg-red-500"
                  : "border-transparent"
              }`
            }
          >
            <button className="btn-sm rounded-full px-8 py-2 text-sm cursor-pointer">
              Returns
            </button>
          </NavLink>

          <NavLink
            to="/returns&orders/orders"
            className={({ isActive, isPending }) =>
              `relative px-8 text-sm transition-all ${
                isPending
                  ? "pending"
                  : isActive
                  ? "text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[4px] after:bg-red-500"
                  : "border-transparent"
              }`
            }
          >
            <button className="btn-sm rounded-full px-8 py-2 text-sm cursor-pointer">
              Orders
            </button>
          </NavLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-12 gap-5 mt-3">
          <div className="col-span-12 lg:col-span-10">
            <Outlet />
          </div>
          {carts?.length > 0 && (
            <div className="border border-transparent shadow-lg grid grid-cols-1 gap-3 p-3 col-span-12 lg:col-span-2 grid-auto-rows-auto">
              <div className="flex flex-col gap-3">
                {carts?.map((cart) => (
                  <Cart
                    key={cart?._id}
                    cart={cart}
                    handleQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <Delivery />
      </div>
    </>
  );
};

export default ReturnsOrders;
