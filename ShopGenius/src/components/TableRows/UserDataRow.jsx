import PropTypes from "prop-types";
import UpdateUserModal from "../Modal/UpdateUserModal";
import { useState } from "react";
import useRole from "../../hooks/useRole";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import LoadingSpinner from "../Shared/LoadingSpinner";

const UserDataRow = ({ user, refetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user: loggedInUser, logOut } = useAuth();
  const [role] = useRole();
  const axiosSecure = useAxiosSecure();

  const { mutateAsync: updateUserAsync, isPending } = useMutation({
    mutationKey: ["update-user"],
    mutationFn: async ({ selectedRole, email }) => {
      const { data } = await axiosSecure.patch(`/update-user-role/${email}`, {
        selectedRole,
      });
      return data;
    },
    onSuccess:()=>{
        setIsOpen(false);
        refetch();
    }
  });

  const modalHandler = async (selectedRole, email) => {
    if (loggedInUser?.email !== email) {
      if (role === "admin") {
        if (user?.status !== "requested") {
          return toast.error(
            "You can not change the user's role unless the user makes a request to change the role"
          );
        }
        console.log("hello", selectedRole, email);
        try {
          const data = await updateUserAsync({ selectedRole, email });
          if (data.modifiedCount > 0) {
            return toast.success("User role has been updated");
          } else {
            return toast.success(`User is already ${role}`);
          }
        } catch (err) {
          return toast.error(err.message);
        }
      } else {
        toast.error("You do not have the authority to this operation");
        await logOut();
      }
    } else {
      return toast.error("Admins can not change their own role!");
    }
  };

  if (isPending) return <LoadingSpinner />;
  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user?.email}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user?.role}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {user?.status ? (
          <p
            className={`${
              user.status === "Verified" ? "text-green-500" : "text-yellow-500"
            } whitespace-no-wrap`}
          >
            {user.status}
          </p>
        ) : (
          <p className="text-red-500 whitespace-no-wrap">Unavailable</p>
        )}
      </td>

      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
          ></span>
          <span className="relative">Update Role</span>
        </button>
        {/* Update User Modal */}
        <UpdateUserModal
          user={user}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          modalHandler={modalHandler}
        />
      </td>
    </tr>
  );
};

UserDataRow.propTypes = {
  user: PropTypes.object,
  refetch: PropTypes.func,
};

export default UserDataRow;
