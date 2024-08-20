import { StoreState } from "client/src/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";

import Logo from "../../../../assets/NestMartLogo.png";
import DropdownCart from "./DropdownCart";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";

const Header = () => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [searchKey, setSearchKey] = useState<string>("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <NavLink to="/">
          <img src={Logo} alt="Logo" className="w-34" />
        </NavLink>

        <form
          className="relative hidden md:block"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchKey) navigate(`/products/search?searchKey=${searchKey}`);
          }}
        >
          <button
            type="submit"
            title="search"
            className="absolute inset-y-0 ltr:inset-r-0 flex items-center justify-center text-white bg-main rounded-md w-8 h-8 top-[3px] end-1"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
          <input
            type="text"
            id="table-search-products"
            className="block p-2 pe-10 text-sm text-gray-900 border border-slate-400 outline-none
              rounded-lg w-80 bg-gray-50 dark:bg-transparent focus:border-slate-500 dark:placeholder-gray-900"
            placeholder="Search for products"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </form>

        {currentUser?._id ? (
          <div className="flex items-center gap-3 2xsm:gap-7">
            <ul className="flex items-center gap-2 2xsm:gap-4">
              {/* <!-- Notification Menu Area --> */}
              <DropdownNotification />
              {/* <!-- Notification Menu Area --> */}

              {/* <!-- Chat Notification Area --> */}
              <DropdownMessage />
              {/* <!-- Chat Notification Area --> */}

              {/* <!-- Cart Area --> */}
              <DropdownCart />
              {/* <!-- Cart Area --> */}
            </ul>

            {/* <!-- User Area --> */}
            <DropdownUser />
            {/* <!-- User Area --> */}
          </div>
        ) : (
          <Link to="/auth" className="flex items-center bg-main text-white py-2 px-4 rounded">
            Sign In
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h12m0 0l-3.75 3.75M21 12l-3.75-3.75M3 12h12"
              />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
