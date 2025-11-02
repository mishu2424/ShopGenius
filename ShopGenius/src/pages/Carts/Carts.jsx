import { useMutation } from "@tanstack/react-query";
import CartItem from "../../components/Shared/cards/CartItem";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import Title from "../../components/Shared/Title";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCart from "../../hooks/useCart";
import { CiShoppingCart } from "react-icons/ci";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import BookingModal from "../../components/Modal/BookingModal";
import CheckOutModal from "../../components/Modal/CheckOutModal";
import { axiosCommon } from "../../hooks/useAxiosCommon";
import { FaSpinner } from "react-icons/fa";
import AddressModal from "../../components/Modal/AddressModal";
import useMyLocation from "../../hooks/useMyLocation";

const Carts = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [carts, isCartLoading, refetch] = useCart();
  const [cartsData, setCartsData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // location
  const { location, getLocation } = useMyLocation();
  const [loc, setLoc] = useState("");
  console.log(loc);

  useEffect(() => {
    if (isOpen && !location) getLocation();
    // console.log(location);
  }, [isOpen, location, getLocation]);

  // ✅ when hook resolves, prefill the autocomplete
  useEffect(() => {
    if (location?.address) {
      setLoc({ label: location.address, value: location });
    }
    console.log(location);
  }, [location]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  useEffect(() => {
    if (carts) setCartsData(carts);
  }, [carts]);

  //   delete from cart
  const { mutateAsync: deleteCartAsync } = useMutation({
    mutationKey: ["cart-delete"],
    mutationFn: async (id) => {
      const { data } = await axiosCommon.delete(`/cart/${id}`);
      return data;
    },
    onSuccess: () => {
      refetch();
      navigate(`/carts`);
    },
  });
  console.log([...carts]);

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

  // ✅ total updates dynamically based on cartsData
  const total = cartsData.reduce(
    (sum, item) => sum + (item?.totalPrice || 0) * (item?.orderQuantity || 1),
    0
  );

  const totalItems = useMemo(
    () =>
      cartsData.reduce(
        (sum, item) => sum + (item?.orderQuantity ?? item?.quantity ?? 1),
        0
      ),
    [cartsData]
  );

  // checkout-payment
  const { mutateAsync: paymentAsync } = useMutation({
    mutationKey: ["checkout-payment"],
    mutationFn: async (items) => {
      const { data } = await axiosSecure.post(`/create-checkout-session`, {
        items,
      });
      return data;
    },
    onSuccess: () => {
      // setProcessing(false);
    },
    onError: () => {
      setProcessing(false);
    },
  });

  const checkOutPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // const availableItems = carts.filter((cart) => {
      //   console.log(cart?.availability?.available, cart?.availability?.status);
      //   return (
      //     cart?.availability?.available &&
      //     cart?.availability?.status !== "Out of Stock" &&
      //     cart?.availability.stock > cart?.availability?.quantity
      //   );
      // });
      // console.log(availableItems);
      const address = loc?.label;
      const comment = e.target.comment.value;
      const deliveryPreference = e.target.deliveryPreference.value;
      if (!address) {
        return toast.error("Please provide your address");
      }
      const deliveryInformation = {
        address,
        comment,
        deliveryPreference,
      };

      const sortedCartItems = carts
        .filter((cart) => {
          console.log(
            cart?.availability?.available,
            cart?.availability?.status,
            cart?.availability.stock > cart?.quantity
          );
          if (!cart?.availability?.available) {
            toast.error(
              `You can not buy ${cart?.title} as it is either out of stock or not available at this moment! Remove this from before proceeding to checkout`
            );
            setProcessing(false);
            return;
          }
          if (cart?.availability?.stock < cart?.quantity) {
            toast.error(
              `You can not buy ${cart?.quantity} items as only ${cart?.availability?.stock} items are available in stock right now!`
            );
            setProcessing(false);
            return;
          }
          // console.log('came here');
          return (
            cart?.availability?.available &&
            cart?.availability?.status !== "Out of Stock" &&
            cart?.availability.stock > cart?.quantity
          );
        })
        .map((item) => {
          return {
            // cartLineId: item._id, // your internal cart line id
            productBookingId: item.productBookingId,
            title: item.title,
            brand: item.brand,
            category: item.category,
            selectedImage: item.selectedImage,
            sold_count: item.sold_count,
            selectedColor: item.selectedColor,
            quantity: item?.quantity,
            price: item?.totalPrice, // what Stripe expects per item
            currency: item.currency ?? "CAD",
            seller: item.seller, // optional meta you may pass along
            user: item.userInfo,
            deliveryInformation,
          };
        });

      console.log(sortedCartItems);
      const data = await paymentAsync(sortedCartItems);
      // console.log(data.url);
      window.location.href = data?.url;
      setProcessing(false);
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  if (isCartLoading) return <LoadingSpinner />;

  if (!carts || carts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 text-lg">
        🛒 Your cart is empty.
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Carts | ShopGenius</title>
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
            <p className="text-gray-700 mb-1">Subtotal ({totalItems} items):</p>
            <p className="text-2xl font-bold text-[#B12704]">
              ${Number(total.toFixed(2))}
            </p>
            <button
              // onClick={checkOutPayment}
              onClick={() => setIsOpen(true)}
              className="cursor-pointer mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold py-2 rounded-md transition"
            >
              {processing ? (
                <span>
                  <FaSpinner className="m-auto animate-spin" />
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </button>
            {/* address modal */}
            <AddressModal
              loc={loc}
              setLoc={setLoc}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              handleCheckOut={checkOutPayment}
              totalPrice={total}
              processing={processing}
            />
            {/* <CheckOutModal
              closeModal={closeBookingModal}
              isOpen={isBookingModalOpen}
              bookingInfo={[...carts]}
              refetch={refetch}
              totalPrice={total}
            /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Carts;
