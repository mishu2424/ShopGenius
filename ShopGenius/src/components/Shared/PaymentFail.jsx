import paymentFailed from "../../assets/paymentFailed.json";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
const PaymentFail = () => {
  toast.error("Payment Failed!");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-72">
        <Lottie animationData={paymentFailed} loop={true}></Lottie>
      </div>
      <Link to={`/carts`}>
        <button className="btn py-2 px-6 bg-red-500 text-white rounded-md cursor-pointer">
          Go Back To Carts
        </button>
      </Link>
    </div>
  );
};

export default PaymentFail;
