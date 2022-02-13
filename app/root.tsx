import type { LinksFunction, MetaFunction } from "remix";
import { Links, LiveReload, Outlet, useCatch, Meta, Scripts } from "remix";
import Header from "./components/Header";

import styles from "./tailwind.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
  // return [
  //   {
  //     rel: "stylesheet",
  //     href: globalStylesUrl,
  //   },
  //   {
  //     rel: "stylesheet",
  //     href: globalMediumStylesUrl,
  //     media: "print, (min-width: 640px)",
  //   },
  //   {
  //     rel: "stylesheet",
  //     href: globalLargeStylesUrl,
  //     media: "screen and (min-width: 1024px)",
  //   },
  // ];
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

function Document({
  children,
  title = `Explit`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body className="bg-base-300 m-0 min-h-screen">
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
