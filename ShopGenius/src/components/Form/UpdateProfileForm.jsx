import PropTypes from "prop-types";
import { TbFidgetSpinner } from "react-icons/tb";
import { FiUser, FiUpload } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

const UpdateProfileForm = ({
  handleUpdateProfile,
  handleImagePreview,
  imageFile,
  imageText,
  setIsOpen,
}) => {
  const { user, loading } = useAuth();

  return (
    <form
      onSubmit={handleUpdateProfile}
      className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur border border-gray-100 shadow-md rounded-2xl p-6 space-y-6"
      noValidate
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* Avatar preview */}
          <img
            src={
              imageFile || user?.photoURL || "https://i.pravatar.cc/100?img=1"
            }
            alt="Profile preview"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          {/* <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
            <FiUpload />
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && handleImagePreview(e.target.files[0])
              }
              className="hidden"
            />
          </span> */}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Update profile
          </h2>
          <p className="text-sm text-gray-500">Keep your info fresh ✨</p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
            defaultValue={user?.displayName || ""}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition"
            data-temp-mail-org="0"
          />
        </div>
      </div>

      {/* Image picker */}
      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-medium text-gray-700">
          Profile photo
        </label>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 truncate">
              {imageText
                ? imageText.length > 30
                  ? `${imageText.slice(0, 22)}…${imageText.slice(-8)}`
                  : imageText
                : "PNG, JPG up to 5MB"}
            </p>
            <p className="text-xs text-gray-400">
              Click "Choose file" to replace
            </p>
          </div>

          <label
            htmlFor="image"
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 active:bg-blue-600/90 cursor-pointer transition"
          >
            <FiUpload /> Choose file
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && handleImagePreview(e.target.files[0])
              }
              className="hidden"
            />
          </label>
        </div>

        {/* Tiny preview row */}
        {/* {imageFile && (
          <div className="flex items-center gap-2 pt-1">
            <img
              src={imageFile}
              alt="Selected preview"
              className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
            />
            <span className="text-xs text-gray-500 truncate">{imageText}</span>
          </div>
        )} */}
      </div>

      {/* Submit */}
      <button
        disabled={loading}
        type="submit"
        className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <>
            <TbFidgetSpinner className="animate-spin" /> Updating…
          </>
        ) : (
          "Update profile"
        )}
      </button>
      <button
        type="button"
        className="inline-flex cursor-pointer w-full justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </button>
    </form>
  );
};

UpdateProfileForm.propTypes = {
  handleUpdateProfile: PropTypes.func,
  handleImagePreview: PropTypes.func,
  imageFile: PropTypes.string,
  imageText: PropTypes.string,
};

export default UpdateProfileForm;
