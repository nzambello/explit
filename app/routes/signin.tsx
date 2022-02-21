import type { ActionFunction, LinksFunction, MetaFunction } from "remix";
import { useActionData, json, Link, useSearchParams, Form } from "remix";
import { db } from "~/utils/db.server";
import { createUserSession, register } from "~/utils/session.server";
import Header from "../components/Header";

export const links: LinksFunction = () => {
  return [];
};

export const meta: MetaFunction = () => {
  return {
    title: "Explit | Sign in",
    description: "Sign in to track and split your expenses!",
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

function validateConfirmPassword(confirmPassword: unknown, password: string) {
  if (typeof confirmPassword !== "string" || confirmPassword !== password) {
    return `Passwords must match`;
  }
}

function validateIcon(icon: unknown) {
  if (typeof icon !== "string") {
    return `Icons must be a single character, e.g. "A" or "😎"`;
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
    teamId: string | undefined;
    confirmPassword: string | undefined;
    icon: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
    confirmPassword: string;
    teamId?: string;
    icon?: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const confirmPassword = form.get("confirmPassword");
  const icon = form.get("icon");
  const teamId = form.get("teamId");
  const redirectTo = form.get("redirectTo") || "/expenses";
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    typeof teamId !== "string" ||
    typeof icon !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { username, password, icon, confirmPassword, teamId };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(confirmPassword, password),
    icon: validateIcon(icon ?? ""),
    teamId: validateTeamId(teamId),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  const userExists = await db.user.findFirst({
    where: { username },
  });
  if (userExists) {
    console.error(userExists);
    return badRequest({
      fields,
      formError: `User with username ${username} already exists`,
    });
  }
  const user = await register({ username, password, icon, teamId });
  if (!user) {
    return badRequest({
      fields,
      formError: `Something went wrong trying to create a new user.`,
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
        <div className="card bg-base-200 w-full shadow-lg max-w-lg">
          <div className="card-body w-full">
            <h1 className="card-title">Sign In</h1>
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
                  className={`input input-bordered${
                    Boolean(actionData?.fieldErrors?.username)
                      ? " input-error"
                      : ""
                  }`}
                  defaultValue={actionData?.fields?.username}
                  aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                  aria-describedby={
                    actionData?.fieldErrors?.username
                      ? "username-error"
                      : undefined
                  }
                />
                {actionData?.fieldErrors?.username && (
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
                      <label id="username-error">
                        {actionData?.fieldErrors.username}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-control mb-3">
                <label htmlFor="icon-input" className="label">
                  <span className="label-text">Icon</span>
                </label>
                <input
                  type="text"
                  id="icon-input"
                  name="icon"
                  className={`input input-bordered${
                    Boolean(actionData?.fieldErrors?.icon)
                      ? " input-warning"
                      : ""
                  }`}
                  defaultValue={actionData?.fields?.icon}
                  aria-invalid={Boolean(actionData?.fieldErrors?.icon)}
                  aria-describedby={
                    actionData?.fieldErrors?.icon ? "icon-error" : undefined
                  }
                />
                <label className="label">
                  <span className="label-text-alt">
                    Icon defaults to inital letter of username, can be a single
                    character or emoji
                  </span>
                </label>
                {actionData?.fieldErrors?.icon && (
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
                      <label id="icon-error">
                        {actionData?.fieldErrors.icon}
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
                  className={`input input-bordered${
                    Boolean(actionData?.fieldErrors?.password)
                      ? " input-error"
                      : ""
                  }`}
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
                        {actionData?.fieldErrors.password}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-control mb-3">
                <label htmlFor="confirmPassword-input" className="label">
                  <span className="label-text">Confirm password</span>
                </label>
                <input
                  id="confirmPassword-input"
                  name="confirmPassword"
                  className={`input input-bordered${
                    Boolean(actionData?.fieldErrors?.confirmPassword)
                      ? " input-error"
                      : ""
                  }`}
                  defaultValue={actionData?.fields?.confirmPassword}
                  type="password"
                  aria-invalid={
                    Boolean(actionData?.fieldErrors?.confirmPassword) ||
                    undefined
                  }
                  aria-describedby={
                    actionData?.fieldErrors?.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />
                {actionData?.fieldErrors?.confirmPassword && (
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
                      <label id="confirmPassword-error">
                        {actionData?.fieldErrors.confirmPassword}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-control mb-3">
                <label htmlFor="teamId-input" className="label">
                  <span className="label-text">Team</span>
                </label>
                <input
                  type="text"
                  id="teamId-input"
                  name="teamId"
                  className={`input input-bordered${
                    Boolean(actionData?.fieldErrors?.teamId)
                      ? " input-error"
                      : ""
                  }`}
                  defaultValue={actionData?.fields?.teamId}
                  aria-invalid={Boolean(actionData?.fieldErrors?.teamId)}
                  aria-describedby={
                    actionData?.fieldErrors?.teamId ? "teamid-error" : undefined
                  }
                />
                {actionData?.fieldErrors?.teamId && (
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
                      <label id="teamid-error">
                        {actionData?.fieldErrors.teamId}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              {actionData?.formError && (
                <div className="alert alert-error mt-5" role="alert">
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
                    <label id="form-error-message">
                      {actionData?.formError}
                    </label>
                  </div>
                </div>
              )}
              <div className="text-center max-w-xs mx-auto mt-10">
                <button type="submit" className="btn btn-primary btn-block">
                  Sign in
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <ul className="menu px-3 menu-horizontal rounded-box max-w-xs mx-auto flex items-center justify-evenly">
        <li>
          <Link to="/" className="btn btn-outline btn-accent">
            Home
          </Link>
        </li>
        <li>
          <Link to="/login" className="btn btn-outline btn-accent">
            Login
          </Link>
        </li>
      </ul>
    </>
  );
}
