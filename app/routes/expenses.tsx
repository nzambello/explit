import type { User, Team } from "@prisma/client";
import type { LinksFunction, LoaderFunction } from "remix";
import { Outlet, useLoaderData, Form, redirect, useCatch } from "remix";
import { getUser } from "~/utils/session.server";
import Header from "../components/Header";

export const links: LinksFunction = () => {
  return [];
};

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

export default function ExpensesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <Header user={data.user} route="/expenses" />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return redirect("/login");
  }
  if (caught.status === 404) {
    return (
      <div className="error-container">There are no expenses to display.</div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
