import paymentSuccess from "../../assets/paymentSuccess.json";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import SplashScreen from "./SplashScreen";
import useCart from "../../hooks/useCart";
import { FaLeftLong, FaRightLong } from "react-icons/fa6";
import moment from "moment";
const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [carts, , isCartLoading, refetch] = useCart();

  // update quantity
  const { mutateAsync: updateQuantityStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationKey: ["product-sold_count"],
      mutationFn: async ({ id, soldCount, orderedQuantity}) => {
        // console.log(bookingInfo?.sold_count + bookingInfo?.quantity);
        const { data } = await axiosSecure.patch(
          `/update-product-sold-count/${id}`,
          { sold_count: soldCount, orderedQuantity }
        );
        return data;
      },
      onSuccess: () => {
        refetch();
      },
      onError: () => {
        toast.error(
          `Something went wrong while updating product's sold count status!`
        );
      },
    });

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        if (!sessionId) return;
        console.log(sessionId);
        setLoading(true);
        const { data } = await axiosSecure(
          `/api/stripe/checkout-session?session_id=${sessionId}`
        );

        if (data.alreadyProcessed) {
          console.log("Payment already processed");
          toast.success("Order already created!");
          setLoading(false);
          return;
        }

        const session = data.session;
        const items = data.items || [];
        console.log(data);
        console.log(session);

        // paymentIntentId (string or expanded object)
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        console.log("paymentId", paymentIntentId);

        // OPTIONAL: guard to ensure it's paid
        if (session.payment_status !== "paid") {
          toast.error("Payment not completed.");
          setLoading(false);
          return;
        }

        console.log(items);

        // If you book 1 item => single booking
        // If multiple items => create one "batch" booking or multiple docs — your choice.
        // Example: one booking doc that contains all items:
        const rDate = moment(new Date());
        const oneMonthLater = rDate.add(1, "months");
        const bookingDoc = {
          sessionId,
          date: new Date().toLocaleString("en-US", {
            timeZone: "America/Toronto",
          }),
          returningEndDate: moment(oneMonthLater.toISOString()).format(
            "MM/DD/YYYY, h:mm:ss A"
          ),
          transactionId: paymentIntentId,
          currency: session.currency,
          invoice: session.invoice,
          deliveryStatus: "Pending",
          items: items.map((i) => ({
            productBookingId: i.productBookingId,
            title: i.title,
            brand: i.brand,
            originalPrice: i.originalPrice,
            selectedImage: i.selectedImage,
            category: i.category,
            color: i.color,
            totalPrice: i.price,
            quantity: i.quantity,
            sold_count: i.sold_count + i.quantity,
            seller: i.seller,
            user: i.user,
            deliveryInformation: i.deliveryInformation,
          })),
          source: "checkout_success",
        };
        console.log(bookingDoc);

        await axiosSecure.post("/booking", bookingDoc); // your existing /booking route
        items.forEach(async (item) => {
          console.log(item);
          const id = item.productBookingId;
          console.log(item, item?.productBookingId);
          const soldCount = item?.quantity;
          const orderedQuantity=item?.quantity;
          await updateQuantityStatus({ id, soldCount, orderedQuantity });
        });
        toast.success("Payment Successful!");
      } catch (err) {
        console.error(err);
        console.log(err);
        toast.error("Could not complete booking save.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  // toast.success("Payment Successful!");
  if (loading || isCartLoading) return <LoadingSpinner />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50/50">
      <div className="w-72 flex flex-col items-center px-20 py-10 justify-center bg-white">
        <Lottie animationData={paymentSuccess} loop={true}></Lottie>
        <div className="flex flex-col items-center justify-center gap-3 mt-5 text-xs text-gray-500">
          <Link to={`/dashboard/my-orders`}>
            <span className="rounded-md cursor-pointer">
              <FaRightLong className="inline-block" /> Go To Orders
            </span>
          </Link>
          <Link to={`/products`}>
            <button className="rounded-md cursor-pointer">
              <FaLeftLong className="inline-block" /> Go Back To Main Menu
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
