import type { User, Team } from "@prisma/client";
import { useEffect, useState } from "react";
import type { LinksFunction, LoaderFunction } from "remix";
import { useLoaderData, Form, redirect, useCatch } from "remix";
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

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
];

export default function ExpensesRoute() {
  const data = useLoaderData<LoaderData>();
  const [activeTab, setActiveTab] = useState<"preferences" | "manage">(
    "preferences"
  );
  const [activeTheme, setActiveTheme] = useState(data.user?.theme || "dark");
  useEffect(() => {
    document?.querySelector("html")?.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  return (
    <>
      <Header user={data.user} route="/account" />
      <main className="p-2 lg:py-4 lg:px-6">
        <div className="card shadow-lg p-4 lg:p-6">
          <h1 className="mb-2 lg:mb-6 text-2xl">Account</h1>
          <div className="tabs tabs-boxed my-6 mr-auto">
            <button
              className={`tab lg:tab-lg${
                activeTab === "preferences" ? " tab-active" : ""
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              Preferences
            </button>
            <button
              className={`tab lg:tab-lg${
                activeTab === "manage" ? " tab-active" : ""
              }`}
              onClick={() => setActiveTab("manage")}
            >
              Manage account
            </button>
          </div>

          <Form autoComplete="off">
            <fieldset
              id="preferences"
              className={activeTab === "preferences" ? "" : "hidden"}
            >
              <div className="p-6 card bordered">
                <h3 id="theme" className="mb-4">
                  Theme
                </h3>
                {themes.map((theme) => (
                  <div className="form-control" key={theme}>
                    <label className="cursor-pointer label">
                      <span className="label-text">{theme}</span>
                      <input
                        type="radio"
                        name="theme"
                        checked={activeTheme === theme}
                        onChange={(e) => {
                          if (e.target.checked) setActiveTheme(theme);
                        }}
                        className="radio"
                        aria-labelledby="#theme"
                        value={theme}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset
              id="manage"
              className={activeTab === "manage" ? "" : "hidden"}
            >
              <div className="p-6 card bordered">
                <div className="form-control mb-4">
                  <label className="label" htmlFor="username">
                    <span className="label-text">Username: </span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="input input-bordered"
                    readOnly
                    disabled
                    value={data.user?.username}
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label" htmlFor="icon">
                    <span className="label-text">Icon: </span>
                  </label>
                  <input
                    type="text"
                    id="icon"
                    className="input"
                    defaultValue={data.user?.icon}
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label" htmlFor="team">
                    <span className="label-text">Team: </span>
                  </label>
                  <input
                    type="text"
                    id="team"
                    className="input"
                    value={data.user?.team.id}
                    disabled
                    readOnly
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label" htmlFor="password">
                    <span className="label-text">Change password: </span>
                  </label>
                  <input type="password" id="password" className="input" />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="confirmPassword">
                    <span className="label-text">Confirm password: </span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="input"
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex justify-center align-center mt-6">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </Form>
        </div>
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
