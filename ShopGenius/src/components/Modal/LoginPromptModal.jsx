// src/components/Modal/LoginPrompt.jsx
import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { RxCross2 } from "react-icons/rx";
import logo from '../../assets/logo.png'

const DISMISS_KEY = "sg_login_prompt_dismissed_at";
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const OPEN_DELAY_MS = 5000; // 5s

export default function LoginPromptModal() {
  const { user } = useAuth() || {};
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // console.log(location?.pathname);
  // Don’t show on auth/checkout-like routes
  const shouldSkip = useMemo(() => {
    const p = location.pathname.toLowerCase();
    // console.log(p.startsWith("/"));
    return ["/login", "/register", "/signup", "/checkout", "/payment-success", "/payment-fail", "/dashboard"].some((r) =>
      p.startsWith(r)
    );
  }, [location.pathname]);

  // Check if dismissed within TTL
  const dismissedRecently = useMemo(() => {
    const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return t && Date.now() - t < DISMISS_TTL_MS;
  }, []);

  useEffect(() => {
    if (user?.email) return;         // already logged in
    if (shouldSkip) return;          // skip specific routes
    if (dismissedRecently) return;   // don’t nag

    const id = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(id);
  }, [user?.email, shouldSkip, dismissedRecently]);

  const closeAndRemember = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  const goLogin = () => {
    // remember where user came from
    navigate("/login", { state: { from: location }, replace: false });
  };

  const goSignup = () => {
    // remember where user came from
    navigate("/signup", { state: { from: location }, replace: false });
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeAndRemember}>
        {/* overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
        </Transition.Child>

        {/* panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                {/* header */}
                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Sign in to ShopGenius
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={closeAndRemember}
                    className="rounded-md p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close"
                  >
                    <RxCross2 className="h-5 w-5 cursor-pointer" />
                  </button>
                </div>

                {/* body */}
                <div className="mt-3 text-sm text-gray-600 flex flex-col items-center justify-center">
                  <h3 className="text-xs">Create an account or sign in to track orders, save carts, and get personalized deals.</h3>
                  <div>
                    <img className="w-18 h-18" src={logo} alt="logo" />
                  </div>
                </div>

                {/* actions */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={goLogin}
                    className="inline-flex cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={goSignup}
                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Sign up
                  </button>
                </div>

                {/* small print */}
                <p className="mt-3 text-xs text-gray-500">
                  Sign in/Sign up to access the features. 
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
