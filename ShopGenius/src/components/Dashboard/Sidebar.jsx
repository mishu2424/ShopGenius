import { useState } from "react";
import { GrLogout } from "react-icons/gr";
import { FcSettings } from "react-icons/fc";
import { BsFillHouseAddFill, BsGraphUp } from "react-icons/bs";
import { MdHomeWork } from "react-icons/md";
import { AiOutlineBars } from "react-icons/ai";
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import useAuth from "../../hooks/useAuth";
import { RxCross1 } from "react-icons/rx";
import useRole from "../../hooks/useRole";
import UserMenu from "./Menu/UserMenu";
import SellerMenu from "./Menu/SellerMenu";
import AdminMenu from "./Menu/AdminMenu";
import ToggleBtn from "../Shared/Button/ToggleBtn";

const Sidebar = ({ isActive, setActive }) => {
  const { logOut, user, toggle, setToggle } = useAuth();
  const [role] = useRole();
  // console.log(role);

  const handleToggle = () => setActive((prev) => !prev);
  const toggleHandler = (e) => {
    // console.log(e.target.checked);
    setToggle(!toggle);
  };

  // console.log(isActive);
  return (
    <>
      {/* 🔹 Top Bar (Visible on all screens) */}
      <div className="bg-gray-100 text-gray-800 flex justify-between items-center w-full px-3 py-2 shadow-md fixed top-0 left-0 z-50">
        <Link to="/">
          <img src={logo} alt="logo" width="60" height="60" />
        </Link>

        {isActive ? (
          <button
            onClick={handleToggle}
            className="p-2 rounded-full transition  bg-blue-500 text-white cursor-pointer"
          >
            <RxCross1 className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={handleToggle}
            className="p-2 rounded-md hover:bg-gray-200 hover:text-blue-500 bg-blue-500 text-white transition cursor-pointer"
          >
            <AiOutlineBars className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* 🔹 Sidebar Drawer */}
      <div
        className={`fixed z-50 flex flex-col justify-between bg-gray-100 w-64 h-full px-2 py-4 left-0 top-0 transform transition-transform duration-300 ease-in-out
        ${isActive ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mt-16">
          {" "}
          {/* pushes below the top bar */}
          <div className="flex flex-col items-center justify-center mb-4">
            <Link to="/">
              <img src={logo} alt="logo" width="80" height="80" />
            </Link>
            {role === "seller" && <ToggleBtn toggleHandler={toggleHandler} />}
          </div>
          {/* 🔸 Navigation Links */}
          <nav className="flex flex-col space-y-2">
            {role === "user" && <UserMenu />}
            {role === "seller" && (!toggle ? <SellerMenu /> : <UserMenu />)}
            {role === "admin" && <AdminMenu />}
          </nav>
        </div>

        {/* 🔹 Footer (Profile & Logout) */}
        <div className="mb-4 border-t border-gray-300 pt-4">
          <div className="flex items-center justify-between mt-6">
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors duration-300 gap-x-2  ${
                  isActive
                    ? "bg-transparent text-gray-700"
                    : "text-gray-600 hover:bg-gray-300 hover:text-gray-700"
                }`
              }
            >
              {/* <div className="flex items-center gap-2"> */}
              <img
                className="object-cover rounded-full h-7 w-7"
                src={user?.photoURL}
                alt="avatar"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                John Doe
              </span>
              {/* </div> */}
            </NavLink>

            <button
              onClick={() => {
                logOut();
              }}
              className="text-gray-500 cursor-pointer transition-colors duration-200 rotate-180 dark:text-gray-400 rtl:rotate-0 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
          {/* <NavLink
            to="/dashboard/profile"
            onClick={() => setActive(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors duration-300 ${
                isActive
                  ? "bg-gray-300 text-gray-700"
                  : "text-gray-600 hover:bg-gray-300 hover:text-gray-700"
              }`
            }
          >
            <FcSettings className="w-5 h-5" />
            <span className="ml-3 font-medium">Profile</span>
          </NavLink>

          <button
            onClick={() => {
              logOut();
              setActive(false);
            }}
            className="flex w-full items-center px-4 py-2 mt-3 text-gray-600 hover:bg-gray-300 hover:text-gray-700 rounded-md transition-colors duration-300"
          >
            <GrLogout className="w-5 h-5" />
            <span className="ml-3 font-medium">Logout</span>
          </button> */}
        </div>
      </div>

      {/* 🔹 Overlay (click to close sidebar) */}
      {/* {isActive && (
        <div
          onClick={handleToggle}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
        />
      )} */}
    </>
  );
};

export default Sidebar;
