import {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
} from "remix";
import type { User, Team } from "@prisma/client";
import { Links, LiveReload, Outlet, useCatch, Meta, Scripts } from "remix";
import { getUser } from "./utils/session.server";

import styles from "./tailwind.css";
import headerStyles from "./styles/header.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: headerStyles },
  ];
};

export const meta: MetaFunction = () => {
  const description = `Track and split shared expenses with friends and family.`;
  return {
    description,
    keywords:
      "Explit,expenses,split,flatmate,friends,family,payments,debts,money",
    "twitter:creator": "@rawmaterial_it",
    "twitter:site": "@rawmaterial_it",
    "twitter:title": "Explit",
    "twitter:description": description,
  };
};

type LoaderData = {
  user: (User & { team: Team & { members: User[] } }) | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const data: LoaderData = {
    user,
  };
  return data;
};

function Document({
  children,
  title = `Explit`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const data = useLoaderData<LoaderData>();

  return (
    <html lang="en" data-theme={data?.user?.theme ?? "dark"}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body className="bg-base-300 m-0 min-h-screen p-3">
        {children}
        <Scripts />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
