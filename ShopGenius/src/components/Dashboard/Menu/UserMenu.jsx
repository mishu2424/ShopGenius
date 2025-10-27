import { BsFingerprint, BsGraphUp } from "react-icons/bs";
import { GrUserAdmin } from "react-icons/gr";
import { useState } from "react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import useRole from "../../../hooks/useRole";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import MenuItem from "./MenuItem";
import SellerModal from "../../Modal/SellerModal";
import { FaCartShopping, FaJediOrder } from "react-icons/fa6";
import { FiShoppingBag } from "react-icons/fi";

const UserMenu = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [role, isLoading] = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleHostRequest = async () => {
    try {
      const newUser = {
        email: user?.email,
        name: user?.displayName,
        role: "user",
        status: "requested",
      };
      const { data } = await axiosSecure.put("/users", newUser);
      if (data.modifiedCount > 0) {
        return toast.success("Seller request has been sent!");
      } else {
        return toast.success(
          "Request had already been made! Please wait for admin approval!"
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      closeModal();
    }
  };
  // console.log(role);

  if (isLoading) return <LoadingSpinner />;
  return (
    <>
      {/* Statistics */}
      <MenuItem
        address={`/dashboard/user-stats`}
        label={"Statistics"}
        icon={BsGraphUp}
      />
      <MenuItem
        icon={FiShoppingBag}
        label="My Orders"
        address="/dashboard/my-orders"
      />
      <MenuItem
        icon={FaCartShopping}
        label="My Carts"
        address="/dashboard/my-carts"
      />

      {role === "user" && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center px-4 py-2 mt-5  transition-colors duration-300 transform text-gray-600  hover:bg-gray-300   hover:text-gray-700 cursor-pointer"
        >
          <GrUserAdmin className="w-5 h-5" />

          <span className="mx-4 font-medium">Become A Seller</span>
        </button>
      )}
      <SellerModal
        isOpen={isOpen}
        closeModal={closeModal}
        handleHostRequest={handleHostRequest}
      />
    </>
  );
};

export default UserMenu;