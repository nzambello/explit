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
      <div className="container">
        <div className="content">
          <h1>Explit</h1>
        </div>
      </div>
    </>
  );
}
