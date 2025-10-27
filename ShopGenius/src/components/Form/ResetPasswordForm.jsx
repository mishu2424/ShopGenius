import useAuth from "../../hooks/useAuth";


export default function ResetPasswordForm({ handleResetPassword, resetEmail }) {
  const { user = "" } = useAuth();
  return (
    <form onSubmit={handleResetPassword}>
      <div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            defaultValue={user?.email || resetEmail}
            disabled
            name="email"
            className="border border-gray-400 w-full rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="btn px-6 py-2 bg-[#2381D3] text-white rounded w-full mt-2"
        >
          Reset Password
        </button>
      </div>
    </form>
  );
}