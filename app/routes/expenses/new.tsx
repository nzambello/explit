import { User } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "remix";
import {
  useActionData,
  redirect,
  json,
  useCatch,
  Link,
  Form,
  useTransition,
  useLoaderData,
} from "remix";
import { db } from "~/utils/db.server";
import { requireUserId, getUser, getUserId } from "~/utils/session.server";

function validateExpenseDescription(description: string) {
  if (description.length < 2) {
    return `That expense's description is too short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    description: string | undefined;
    amount?: string | undefined;
    user?: string | undefined;
  };
  fields?: {
    description: string;
    amount: number;
  };
};

type LoaderData = {
  userId: string | null;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const data: LoaderData = { userId };
  return data;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);
  const form = await request.formData();
  const description = form.get("description");
  const amount = parseInt(form.get("amount")?.toString() || "0", 10);
  if (
    typeof description !== "string" ||
    typeof amount !== "number" ||
    user === null
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    description: validateExpenseDescription(description),
  };
  const fields = { description, amount };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const expense = await db.expense.create({
    data: { ...fields, userId: userId, teamId: user.teamId },
  });
  return redirect(`/expenses/${expense.id}`);
};

export default function NewExpenseRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if (transition.submission) {
    const description = transition.submission.formData.get("description");
    const amount = transition.submission.formData.get("content");
    if (
      typeof description === "string" &&
      typeof amount === "number" &&
      !validateExpenseDescription(description)
    ) {
      return (
        <div>
          <p>Description: {description}</p>
          <p>Amount: {amount}€</p>
          <p>User: {data.userId}</p>
        </div>
      );
    }
  }

  return (
    <>
      <div className="container mx-auto min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="card bg-neutral w-full shadow-lg max-w-lg">
          <div className="card-body w-full">
            <h1 className="card-title">Add an expense</h1>
            <Form
              method="post"
              className="mt-5"
              aria-describedby={
                actionData?.formError ? "form-error-message" : undefined
              }
            >
              <div className="form-control mb-3">
                <label className="label" htmlFor="description-input">
                  <span className="label-text">Description</span>
                </label>
                <input
                  type="text"
                  className="input"
                  name="description"
                  id="description-input"
                  defaultValue={actionData?.fields?.description}
                  aria-invalid={
                    Boolean(actionData?.fieldErrors?.description) || undefined
                  }
                  aria-describedby={
                    actionData?.fieldErrors?.description
                      ? "description-error"
                      : undefined
                  }
                />
                {actionData?.fieldErrors?.description && (
                  <div className="alert alert-error mt-3" role="alert">
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
                      <label id="description-error">
                        {actionData?.fieldErrors.description}
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-control mb-3">
                <label className="label" htmlFor="amount-input">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  className="input"
                  id="amount-input"
                  name="amount"
                  defaultValue={actionData?.fields?.amount}
                />
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
                  Add
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <ul className="menu px-3 menu-horizontal rounded-box max-w-xs mx-auto flex items-center justify-evenly">
        <li>
          <Link to="/expenses" className="btn btn-outline btn-accent">
            Back
          </Link>
        </li>
        <li>
          <Link to="/expenses/transfer" className="btn btn-outline btn-accent">
            Transfer
          </Link>
        </li>
      </ul>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to submit an expense.</p>
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
