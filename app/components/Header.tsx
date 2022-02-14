import type { User } from "@prisma/client";
import { Link, Form } from "remix";
import People from "~/icons/People";
import MoneyAdd from "~/icons/MoneyAdd";
import LoginSVG from "../icons/Login";
import Percentage from "~/icons/Percentage";

interface Props {
  user?: User | null;
  route?: string;
}

const Header = ({ user, route }: Props) => {
  return (
    <header className="drawer overflow-visible relative z-50">
      <input id="mobile-nav-drawer" type="checkbox" className="drawer-toggle" />
      <div className="flex flex-col drawer-content !overflow-y-visible">
        <nav className="w-full p-3 shadow-lg rounded-box mb-4 bg-neutral text-neutral-content navbar">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="mobile-nav-drawer"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <Link to="/" className="btn btn-ghost rounded-btn">
              <span className="text-lg font-bold">Explit</span>
            </Link>
          </div>
          <div className="flex-none hidden lg:block">
            <ul className="menu horizontal">
              <li>
                <Link to="/expenses" className="btn btn-ghost rounded-btn">
                  <MoneyAdd className="lg:mr-2" />
                  <span
                    className={`hidden lg:inline-block ${
                      route === "/expenses" ? "underline" : ""
                    }`}
                  >
                    Expenses
                  </span>
                </Link>
              </li>
              <li>
                <Link to="#" className="btn btn-ghost rounded-btn">
                  <People className="lg:mr-2" />
                  <span
                    className={`hidden lg:inline-block ${
                      route === "/team" ? "underline" : ""
                    }`}
                  >
                    Your team
                  </span>
                </Link>
              </li>
              <li>
                <Link to="#" className="btn btn-ghost rounded-btn">
                  <Percentage className="lg:mr-2" />
                  <span
                    className={`hidden lg:inline-block ${
                      route === "/statistics" ? "underline" : ""
                    }`}
                  >
                    Statistics
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex-none">
            {user ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="btn btn-ghost rounded-full p-0">
                  <div className="rounded-full w-10 h-10 m-1 inline-flex justify-center items-center bg-white text-3xl">
                    {user.icon ?? user.username[0]}
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="p-2 shadow-lg menu dropdown-content bg-base-100 rounded-box w-52 z-10"
                >
                  <li>
                    <Link to="/account" className="text-base-content">
                      <span className="text-base-content">Account</span>
                    </Link>
                  </li>
                  <li>
                    <Form action="/logout" method="post">
                      <button
                        type="submit"
                        className="btn btn-ghost rounded-btn w-full text-base-content capitalize justify-start py-[0.75rem] px-[1.25rem] text-base font-normal"
                      >
                        Logout
                      </button>
                    </Form>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-square btn-ghost"
                title="Login"
              >
                <span className="hidden lg:inline-block mr-1">Login</span>
                <LoginSVG />
              </Link>
            )}
          </div>
        </nav>
      </div>
      <div className="drawer-side">
        <label htmlFor="mobile-nav-drawer" className="drawer-overlay"></label>
        <ul className="p-4 overflow-y-auto menu w-80 max-w-[70%] bg-base-100">
          <li className="items-end mb-2">
            <label
              htmlFor="mobile-nav-drawer"
              className="drawer-close cursor-pointer btn btn-sm btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </label>
          </li>
          <li className="items-start mb-4">
            <Link
              to="/"
              className="btn btn-ghost rounded-btn items-center h-auto"
            >
              <span className="text-lg font-bold">Explit</span>
            </Link>
          </li>
          <li className="items-start">
            <Link to="/expenses" className="btn btn-ghost rounded-btn">
              <MoneyAdd className="mr-2" />
              <span
                className={`inline-block ${
                  route === "/expenses" ? "underline" : ""
                }`}
              >
                Expenses
              </span>
            </Link>
          </li>
          <li className="items-start">
            <Link to="#" className="btn btn-ghost rounded-btn">
              <People className="mr-2" />
              <span
                className={`inline-block ${
                  route === "/team" ? "underline" : ""
                }`}
              >
                Your team
              </span>
            </Link>
          </li>
          <li className="items-start">
            <Link to="#" className="btn btn-ghost rounded-btn">
              <Percentage className="mr-2" />
              <span
                className={`inline-block ${
                  route === "/statistics" ? "underline" : ""
                }`}
              >
                Statistics
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
