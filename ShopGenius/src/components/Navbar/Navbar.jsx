import { FaCartShopping } from "react-icons/fa6";
import logo from "../../assets/logo.png";
import { IoIosSearch } from "react-icons/io";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import profile from '../../assets/placeholder.jpg'
const Navbar = ({ navbarRef }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  // // Optional: lock scroll while dimmed
  // useEffect(() => {
  //   if (searchFocused) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }
  //   return () => (document.body.style.overflow = "");
  // }, [searchFocused]);

  return (
    <div ref={navbarRef} className="relative z-50">
      {/* Dim overlay */}
      {searchFocused && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity"
          onClick={() => setSearchFocused(false)}
        />
      )}
      <div className="navbar flex items-center justify-between bg-[#2c3641] text-white shadow-sm">
        <div className="flex items-center">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{" "}
              </svg>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-72 p-2 shadow"
            >
              <li>
                <div className="flex gap-2">
                  <div>
                    <form>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <input
                          type="text"
                          placeholder="Search"
                          className="input border-r-0 w-40"
                        />
                        <button type="submit">
                          <IoIosSearch
                            size={40}
                            className="border-l rounded-r-lg px-2 text-white cursor-pointer bg-[#2381D3] hover:bg-white hover:text-[#2381D3] duration-300"
                          />
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-circle avatar"
                    >
                      <div className="w-full">
                        <img
                          alt="Tailwind CSS Navbar component"
                          src={profile}
                        />
                      </div>
                    </div>
                    <ul
                      tabIndex="-1"
                      className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow"
                    >
                      <li>
                        <a className="justify-between">Profile</a>
                      </li>
                      <li>
                        <a>Dashboard</a>
                      </li>
                      <li>
                        <Link to={`login`}>Log in</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <img src={logo} alt="logo" className="w-14 h-14" />
        </div>
        <div className="flex gap-2">
          <form className="hidden md:flex">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <input
                type="text"
                placeholder="Search"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="
                  input w-24 md:w-96
                  rounded-none rounded-l-lg
                  border-0
                  focus:outline-none
                  focus:ring-0
                  focus:border-transparent
                  focus:shadow-none
                  text-gray-700
                "
              />
              <button type="submit">
                <IoIosSearch
                  size={40}
                  className="border-l rounded-r-lg px-2 text-white cursor-pointer bg-[#2381D3] hover:bg-white hover:text-[#2381D3] duration-300"
                />
              </button>
            </div>
          </form>
          <div className="dropdown dropdown-end hidden md:flex">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src={profile}
                />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-[#2c3641] text-white rounded-box z-[1] mt-12 w-52 p-2 shadow"
            >
              <li>
                <a className="justify-between">Profile</a>
              </li>
              <li>
                <a>Dashboard</a>
              </li>
              <li>
                <Link to={`login`}>Log in</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink to={`/returns&orders`}>
            <span className="text-sm">Returns & orders</span>
          </NavLink>
          <div className="relative inline-flex ">
            <FaCartShopping size={24} className="text-white" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5">
              {0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
