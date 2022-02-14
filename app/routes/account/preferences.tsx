import type { User, Team } from "@prisma/client";
import type { LinksFunction, LoaderFunction, ActionFunction } from "remix";
import {
  Link,
  useLoaderData,
  useActionData,
  Form,
  redirect,
  useCatch,
  json,
} from "remix";
import { getUser, requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import Check from "~/icons/Check";

export const links: LinksFunction = () => {
  return [];
};

type LoaderData = {
  user: (User & { team: Team & { members: User[] } }) | null;
};

type ActionData = {
  formError?: string;
  formSuccess?: string;
  fieldErrors?: {
    theme: string | undefined;
  };
  fields?: {
    theme: string;
  };
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

const badRequest = (data: ActionData) => json(data, { status: 400 });
const success = (data: ActionData) => json(data, { status: 200 });

const validateTheme = (theme: unknown) => {
  if (typeof theme !== "string" || !themes.includes(theme)) {
    return `That theme is not valid`;
  }
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);
  const form = await request.formData();
  const theme = form.get("theme");
  if (typeof theme !== "string" || user === null) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    theme: validateTheme(theme),
  };
  const fields = { theme };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const updatedUser = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      theme,
    },
  });
  if (!updatedUser) {
    return badRequest({
      formError: `Something went wrong trying to update user.`,
    });
  }
  return success({ formSuccess: "Preferences updated successfully." });
};

export default function AccountPreferencesRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const activeTheme = data.user?.theme || "dark";

  return (
    <>
      <div className="tabs tabs-boxed my-6 mr-auto">
        <Link to="/account/preferences" className="tab lg:tab-lg tab-active">
          Preferences
        </Link>
        <Link to="/account/manage" className="tab lg:tab-lg">
          Manage
        </Link>
      </div>

      <Form autoComplete="off" method="post">
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
                  defaultChecked={activeTheme === theme}
                  onChange={(e) => {
                    if (e.target.checked)
                      document
                        ?.querySelector("html")
                        ?.setAttribute("data-theme", theme);
                  }}
                  className="radio"
                  aria-labelledby="#theme"
                  value={theme}
                />
              </label>
            </div>
          ))}
          {actionData?.fieldErrors?.theme && (
            <div className="alert alert-error mt-2" role="alert">
              <div className="flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 mx-2 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  ></path>
                </svg>
                <label id="password-error">
                  {actionData?.fieldErrors.theme}
                </label>
              </div>
            </div>
          )}
          {actionData?.formSuccess && (
            <div className="alert alert-success mt-2" role="alert">
              <div className="flex-1">
                <Check className="w-6 h-6 mx-2 stroke-current" />
                <label id="teamid-error">{actionData?.formSuccess}</label>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center align-center mt-6">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </Form>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to set your preferences.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
