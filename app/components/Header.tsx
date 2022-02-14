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
    <header className="p-3">
      <nav className="navbar shadow-lg bg-neutral text-neutral-content rounded-box">
        <div className="flex-1 px-2 mx-2">
          <Link to="/" className="btn btn-ghost rounded-btn">
            <span className="text-lg font-bold">Explit</span>
          </Link>
        </div>
        <div className="flex-none px-2 mx-2 lg:flex">
          <div className="flex items-stretch">
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
          </div>
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
                className="p-2 shadow-lg menu dropdown-content bg-base-100 rounded-box w-52"
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
    </header>
  );
};

export default Header;
