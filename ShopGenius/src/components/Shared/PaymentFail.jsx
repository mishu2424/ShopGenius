import paymentFailed from "../../assets/paymentFailed.json";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import { FaLeftLong, FaRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
const PaymentFail = () => {
  toast.error("Payment Failed!");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50/50">
      <div className="w-72 flex flex-col items-center px-20 py-10 justify-center bg-white">
        <Lottie animationData={paymentFailed} loop={true}></Lottie>
        <div className="flex flex-col items-center justify-center gap-3 mt-5 text-xs text-gray-500">
          <Link to={`/carts`}>
            <button className="text-red-500 rounded-md cursor-pointer">
              <FaLeftLong className="inline-block" /> Go Back To Carts
            </button>
          </Link>
          <Link to={`/products`}>
            <button className="rounded-md cursor-pointer">
              Go Back To Main Menu <FaRightLong className="inline-block" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
