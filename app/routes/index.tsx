import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";
import { Link, useLoaderData } from "remix";
import { getUserId } from "~/utils/session.server";

type LoaderData = { userId: string | null };

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
  const userId = await getUserId(request);
  const data: LoaderData = { userId };
  return data;
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="container">
      <div className="content">
        <h1>Explit</h1>
        <nav>
          <ul>
            {data.userId ? (
              <li>
                <Link to="expenses">See expenses</Link>
              </li>
            ) : (
              <li>
                <Link to="login">Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}
