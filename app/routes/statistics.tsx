import type { User, Team } from "@prisma/client";
import type { LoaderFunction } from "remix";
import { redirect, Link, useLoaderData, useCatch } from "remix";
import { getUser } from "~/utils/session.server";
import Header from "../components/Header";

type LoaderData = {
  user: (User & { team: Team & { members: User[] } }) | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user?.id) {
    return redirect("/login");
  }

  const data: LoaderData = {
    user,
  };
  return data;
};

export default function ListExpensesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <Header user={data.user} route="/expenses" />
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
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return redirect("/login");
  }
  if (caught.status === 404) {
    return <div className="error-container">There is no data to display.</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
