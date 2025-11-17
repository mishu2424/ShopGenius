import { useNavigate } from "react-router-dom";
import Container from "./Container";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container>
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Welcome to ShopGenius Prime!
          </h1>
          <p className="text-gray-600 mb-6">
            Your premium subscription is now active. Enjoy all the exclusive benefits!
          </p>
          <ul className="text-left mb-6 space-y-2 text-sm text-gray-700">
            <li>✓ Free Express Delivery</li>
            <li>✓ Member-Only Deals</li>
            <li>✓ Priority Support</li>
            <li>✓ Early Access to Products</li>
          </ul>
          <button
            onClick={() => navigate("/products")}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Shopping
          </button>
        </div>
      </Container>
    </div>
  );
};

export default SubscriptionSuccess;