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
import { getUser, updateUser } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import Check from "~/icons/Check";

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

const badRequest = (data: ActionData) => json(data, { status: 400 });

const success = (data: ActionData) => json(data, { status: 200 });

function validatePassword(password: unknown) {
  if (typeof password === "string" && password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

function validateConfirmPassword(confirmPassword: unknown, password: string) {
  if (typeof confirmPassword === "string" && confirmPassword !== password) {
    return `Passwords must match`;
  }
}

function validateIcon(icon: unknown) {
  if (typeof icon === "string" && icon.length > 2) {
    return `Icons must be a single character, e.g. "A" or "😎"`;
  }
}

function validateTeamId(teamId: unknown) {
  if (typeof teamId === "string" && teamId.length < 1) {
    return "You must indicate an arbitrary team ID";
  }
}

type ActionData = {
  formError?: string;
  success?: string;
  fieldErrors?: {
    icon: string | undefined;
    teamId: string | undefined;
    password: string | undefined;
    confirmPassword: string | undefined;
  };
  fields?: {
    password?: string;
    confirmPassword?: string;
    teamId?: string;
    icon?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  // @ts-ignore
  const user = await getUser(request);
  if (!user)
    return badRequest({
      formError: "You must be logged in to change your settings",
    });

  const form = await request.formData();
  const password = form.get("password");
  const confirmPassword = form.get("confirmPassword");
  const icon = form.get("icon") ?? (user ? user.username[0] : undefined);
  const teamId = form.get("teamId");

  const fields = {
    icon: typeof icon === "string" ? icon : undefined,
    password: typeof password === "string" ? password : undefined,
    confirmPassword:
      typeof confirmPassword === "string" ? confirmPassword : undefined,
    teamId: typeof teamId === "string" ? teamId : undefined,
  };
  const fieldErrors = {
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(
      confirmPassword,
      typeof password === "string" ? password : ""
    ),
    icon: validateIcon(icon),
    teamId: validateTeamId(teamId),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  const nonEmptyFields = Object.entries(fields).reduce((acc, [key, value]) => {
    if (typeof value === "string" && key !== "confirmPassword")
      return { ...acc, [key]: value ?? undefined };
    else return acc;
  }, {});
  const userUpdated = await updateUser({
    id: user.id,
    ...nonEmptyFields,
  });
  if (!userUpdated) {
    return badRequest({
      fields,
      formError: `Something went wrong trying to update user.`,
    });
  }
  return success({
    success: "Your settings have been updated.",
  });
};

export default function AccountPreferencesRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <>
      <div className="tabs tabs-boxed my-6 mr-auto">
        <Link to="/account/preferences" className="tab lg:tab-lg">
          Preferences
        </Link>
        <Link to="/account/manage" className="tab lg:tab-lg tab-active">
          Manage
        </Link>
      </div>

      <Form autoComplete="off" method="post">
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
        <div className="form-control mb-3">
          <label htmlFor="icon-input" className="label">
            <span className="label-text">Icon</span>
          </label>
          <input
            type="text"
            id="icon-input"
            name="icon"
            className={`input input-bordered${
              Boolean(actionData?.fieldErrors?.icon) ? " input-warning" : ""
            }`}
            defaultValue={
              actionData?.fields?.icon ||
              data.user?.icon ||
              data.user?.username[0]
            }
            autoComplete="off"
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
                <label id="icon-error">{actionData?.fieldErrors.icon}</label>
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
              Boolean(actionData?.fieldErrors?.password) ? " input-error" : ""
            }`}
            defaultValue={actionData?.fields?.password}
            autoComplete="new-password"
            type="password"
            aria-invalid={
              Boolean(actionData?.fieldErrors?.password) || undefined
            }
            aria-describedby={
              actionData?.fieldErrors?.password ? "password-error" : undefined
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
            autoComplete="new-password"
            aria-invalid={
              Boolean(actionData?.fieldErrors?.confirmPassword) || undefined
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
              Boolean(actionData?.fieldErrors?.teamId) ? " input-error" : ""
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
          {actionData?.success && (
            <div className="alert alert-success mt-2" role="alert">
              <div className="flex-1">
                <Check className="w-6 h-6 mx-2 stroke-current" />
                <label id="teamid-error">{actionData?.success}</label>
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

      <div className="flex justify-center align-center mt-6">
        <label
          htmlFor="delete-user-modal"
          className="btn btn-error modal-button"
        >
          Delete user
        </label>
      </div>
      <input type="checkbox" id="delete-user-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box absolute left-[10%] right-[10%] top-[40%] w-[80%] rounded-lg">
          <p>
            Do you really want to delete your account? All your data will be
            permanently deleted.
          </p>
          <div className="modal-action">
            <Form action="/account/delete" method="post">
              <button type="submit" className="btn btn-error">
                Delete
              </button>
            </Form>
            <label htmlFor="delete-user-modal" className="btn">
              Cancel
            </label>
          </div>
        </div>
      </div>
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
