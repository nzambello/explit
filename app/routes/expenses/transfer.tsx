import { User } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "remix";
import {
  useActionData,
  redirect,
  json,
  useCatch,
  Link,
  Form,
  useLoaderData,
} from "remix";
import { db } from "~/utils/db.server";
import {
  requireUserId,
  getUser,
  getUserId,
  getUsersByTeam,
} from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    description: string | undefined;
    amount?: string | undefined;
    user?: string | undefined;
    toUser?: string | undefined;
  };
  fields?: {
    description: string;
    amount: number;
    toUser: string;
  };
};

type LoaderData = {
  userId: string | null;
  teamUsers: User[];
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const teamUsers = await getUsersByTeam(request);
  const data: LoaderData = {
    userId,
    teamUsers: teamUsers?.filter((user) => user.id !== userId) ?? [],
  };
  return data;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);
  const form = await request.formData();
  const toUser = form.get("toUser");
  const description = form.get("description") ?? "TRASFER";
  const amount = parseInt(form.get("amount")?.toString() || "0", 10);
  if (
    typeof description !== "string" ||
    typeof amount !== "number" ||
    typeof toUser !== "string" ||
    user === null
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const expenseFrom = await db.expense.create({
    data: {
      description,
      amount,
      userId: userId,
      teamId: user.teamId,
    },
  });
  const expenseTo = await db.expense.create({
    data: {
      description,
      amount: -amount,
      userId: toUser,
      teamId: user.teamId,
    },
  });
  return redirect(`/expenses`);
};

export default function NewExpenseRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <>
      <div className="container mx-auto min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="card bg-base-200 w-full shadow-lg max-w-lg">
          <div className="card-body w-full">
            <h1 className="card-title">Transfer to user</h1>
            <Form
              method="post"
              className="mt-5"
              aria-describedby={
                actionData?.formError ? "form-error-message" : undefined
              }
            >
              <div className="form-control mb-3">
                <label className="label" htmlFor="toUser-input">
                  <span className="label-text">To</span>
                </label>
                <select
                  name="toUser"
                  id="toUser-input"
                  className="select select-bordered w-full max-w-xs"
                  defaultValue={actionData?.fields?.toUser}
                >
                  <option disabled selected>
                    Choose an user from your team
                  </option>
                  {data?.teamUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control mb-3">
                <label className="label" htmlFor="description-input">
                  <span className="label-text">Description</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="description"
                  id="description-input"
                  defaultValue={actionData?.fields?.description}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label" htmlFor="amount-input">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
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
          <Link to="/expenses/new" className="btn btn-outline btn-accent">
            Add new
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
