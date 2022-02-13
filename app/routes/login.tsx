import type { ActionFunction, LinksFunction, MetaFunction } from "remix";
import { useActionData, json, Link, useSearchParams, Form } from "remix";
import { db } from "~/utils/db.server";
import { login, createUserSession, register } from "~/utils/session.server";
import Header from "../components/Header";

export const links: LinksFunction = () => {
  return [];
};

export const meta: MetaFunction = () => {
  return {
    title: "Explit | Login",
    description: "Login to track and split your expenses!",
  };
};

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

function validateTeamId(teamId: unknown) {
  if (typeof teamId !== "string" || teamId.length < 1) {
    return "You must indicate an arbitrary team ID";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/expenses";
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  const user = await login({ username, password });
  if (!user) {
    return badRequest({
      fields,
      formError: `Username/Password combination is incorrect`,
    });
  }
  return createUserSession(user.id, redirectTo);
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Header />
      <div className="container mx-auto min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="card bg-neutral w-full shadow-lg max-w-lg">
          <div className="card-body w-full">
            <h1 className="card-title">Login</h1>
            <Form
              method="post"
              className="mt-5"
              aria-describedby={
                actionData?.formError ? "form-error-message" : undefined
              }
            >
              <input
                type="hidden"
                name="redirectTo"
                value={searchParams.get("redirectTo") ?? undefined}
              />
              <div className="form-control mb-3">
                <label htmlFor="username-input" className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  id="username-input"
                  name="username"
                  className="input"
                  defaultValue={actionData?.fields?.username}
                  aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                  aria-describedby={
                    actionData?.fieldErrors?.username
                      ? "username-error"
                      : undefined
                  }
                />
                {actionData?.fieldErrors?.username && (
                  <div className="alert alert-error" role="alert">
                    <div className="flex-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 mx-2 stroke-current"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        ></path>
                      </svg>
                      <label id="username-error">
                        {actionData?.fieldErrors.username}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-control mb-3">
                <label htmlFor="password-input" className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  id="password-input"
                  name="password"
                  className="input"
                  defaultValue={actionData?.fields?.password}
                  type="password"
                  aria-invalid={
                    Boolean(actionData?.fieldErrors?.password) || undefined
                  }
                  aria-describedby={
                    actionData?.fieldErrors?.password
                      ? "password-error"
                      : undefined
                  }
                />
                {actionData?.fieldErrors?.password && (
                  <div className="alert alert-error" role="alert">
                    <div className="flex-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 mx-2 stroke-current"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        ></path>
                      </svg>
                      <label id="password-error">
                        {actionData?.fieldErrors.password}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div id="form-error-message" className="mt-6 mb-3">
                {actionData?.formError && (
                  <div className="alert alert-error" role="alert">
                    <div className="flex-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 mx-2 stroke-current"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        ></path>
                      </svg>
                      <label>{actionData?.formError}</label>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-10 block w-full"
              >
                Submit
              </button>
            </Form>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="links">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/signin">Sign-in</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
