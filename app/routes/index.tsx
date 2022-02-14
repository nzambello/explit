import type { User } from "@prisma/client";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";
import { Link, useLoaderData } from "remix";
import Header from "~/components/Header";
import { getUser } from "~/utils/session.server";

type LoaderData = { user: User | null };

export const links: LinksFunction = () => {
  return [];
};

export const meta: MetaFunction = () => {
  return {
    title: "Explit: track and split shared expenses",
    description:
      "Explit: track and split shared expenses with friends and family",
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const data: LoaderData = { user };
  return data;
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <Header user={data.user} />
      <div
        className="hero fixed top-0 left-0 h-screen w-screen"
        style={{
          backgroundImage: 'url("/explit.png")',
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="text-center hero-content glass rounded-box w-[80%] py-16 text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Explit</h1>
            <p className="mb-5">
              Track and split shared expenses with friends and family.
            </p>
            <Link to="/signin" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
