import useAuth from "../../../hooks/useAuth";
import { Helmet } from "react-helmet-async";
import useRole from "../../../hooks/useRole";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { ImageBBUpload } from "../../../api/utilities";
import toast from "react-hot-toast";
import UpdateProfileModal from "../../Modal/UpdateProfileModal";
import ResetPasswordModal from "../../Modal/ResetPasswordModal";

const Profile = () => {
  const {
    user,
    loading,
    setLoading,
    updateUserProfile,
    resetPassword,
    logOut,
  } = useAuth() || {};
  const [role] = useRole();
  //   update profile
  const [isOpen, setIsOpen] = useState(false);
  // reset password
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const [imageFile, setImageFile] = useState(user?.photoURL);
  const [imageText, setImageText] = useState("");
  const previewUrlRef = useRef(null);
  // Cleanup any object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleImagePreview = (file) => {
    // file can be null if user cancels the picker
    if (!file) {
      // keep existing preview (user didn’t change)
      setImageText("");
      return;
    }

    // Revoke old URL to avoid memory leaks
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setImageFile(url); // preview URL for <img src=...>
    setImageText(file.name); // show filename in UI
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get("name");
    const image = form.get("image"); // File or empty (if none selected)

    try {
      setLoading(true);

      // Decide the final photo URL:
      // - If a new file is chosen, upload it.
      // - Otherwise, keep the existing user.photoURL.
      let finalPhotoURL = user?.photoURL || null;

      if (image && image instanceof File && image.size > 0) {
        const uploadedUrl = await ImageBBUpload(image);
        finalPhotoURL = uploadedUrl;
      }

      await updateUserProfile(name, finalPhotoURL);

      // Update local preview if we actually changed the photo
      if (finalPhotoURL && finalPhotoURL !== user?.photoURL) {
        setImageFile(finalPhotoURL);
      }

      toast.success("Profile has been updated");
      setIsOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  //   console.log(user)
  const formatRole = (r) => {
    if (typeof r !== "string" || r.trim() === "") return "User";
    const s = r.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    try {
      await resetPassword(email);
      toast.success("Reset email has been sent!");
      setIsResetPasswordOpen(false);
      setLoading(false);
      // await logOut();
    } catch (err) {
      toast.error(err.message);
      setIsResetPasswordOpen(false);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <Helmet>
        <title>Profile | ShopGenius</title>
      </Helmet>
      <div className="bg-white shadow-lg rounded-2xl w-3/5">
        <img
          alt="profile"
          src="https://i.ibb.co/mCwwyP3M/heidi-fin-2-TLREZi7-BUg-unsplash.jpg"
          className="w-full mb-4 object-cover rounded-t-lg h-36"
        />
        <div className="flex flex-col items-center justify-center p-4 -mt-16">
          <div className="relative block">
            <img
              alt="profile"
              src={user?.photoURL}
              className="mx-auto object-cover rounded-full h-24 w-24  border-2 border-white "
            />
          </div>

          <p className="p-2 px-4 text-xs text-white bg-[#2381D3] rounded-full">
            {role && formatRole(role)}
          </p>
          <p className="mt-2 text-xl font-medium text-gray-800 ">
            {/* User Id: {user.uid} */}
          </p>
          <div className="w-full p-2 mt-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 ">
              {user?.displayName && (
                <p className="flex flex-col">
                  Name
                  <span className="font-bold text-black ">
                    {user?.displayName}
                  </span>
                </p>
              )}
              <p className="flex flex-col">
                Email
                <span className="font-bold text-black ">{user?.email}</span>
              </p>

              <div>
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-[#2381D3] px-10 py-1 rounded-lg text-white cursor-pointer hover:bg-[#2381D3] block mb-1"
                >
                  Update Profile
                </button>
                <UpdateProfileModal
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  handleUpdateProfile={handleUpdateProfile}
                  handleImagePreview={handleImagePreview}
                  imageFile={imageFile}
                  imageText={imageText}
                />
                <button
                  onClick={() => setIsResetPasswordOpen(true)}
                  className="bg-[#2381D3] px-7 py-1 rounded-lg text-white cursor-pointer hover:bg-[#2381D3]"
                >
                  Change Password
                </button>
                <ResetPasswordModal
                  handleResetPassword={handleResetPassword}
                  isResetPasswordOpen={isResetPasswordOpen}
                  setIsResetPasswordOpen={setIsResetPasswordOpen}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
