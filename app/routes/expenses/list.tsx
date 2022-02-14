import { Link } from "remix";

export default function ListExpensesRoute() {
  return (
    <div className="hero py-40 bg-base-200 my-8 rounded-box">
      <div className="text-center hero-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Work in progress</h1>
          <p className="mb-5">
            <button className="btn btn-lg loading"></button>
            This page is under construction.
          </p>
          <Link to="/expenses" className="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 mr-2 stroke-current rotate-180"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
