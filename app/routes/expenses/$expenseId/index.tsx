import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import {
  Link,
  useLoaderData,
  useParams,
  useCatch,
  redirect,
  Form,
} from "remix";
import type { Expense, User } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId, getUserId } from "~/utils/session.server";

type LoaderData = { expense: Expense & { user: User }; isOwner: boolean };

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No expense",
      description: "No expense found",
    };
  }
  return {
    title: `Expense: ${data.expense.description} | Explit`,
    description: `Details of expense: ${data.expense.description}`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  if (!userId) {
    redirect("/login");
  }

  const expense = await db.expense.findUnique({
    where: { id: params.expenseId },
    include: {
      user: true,
    },
  });
  if (!expense) {
    throw new Response("What an expense! Not found.", {
      status: 404,
    });
  }
  const data: LoaderData = {
    expense,
    isOwner: userId === expense.userId,
  };
  return data;
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_method") === "delete") {
    const userId = await requireUserId(request);
    const expense = await db.expense.findUnique({
      where: { id: params.expenseId },
    });
    if (!expense) {
      throw new Response("Can't delete what does not exist", { status: 404 });
    }
    if (expense.userId !== userId) {
      throw new Response("Pssh, nice try. That's not your expense", {
        status: 401,
      });
    }
    await db.expense.delete({ where: { id: params.expenseId } });
    return redirect("/expenses");
  }
};

export default function ExpenseRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="card shadow-lg bg-base-100 my-4">
      <div className="flex-col items-center card-body p-4">
        <div className="flex flex-row w-full items-center">
          <Link to="/expenses" className="btn btn-ghost mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 mr-2 stroke-current rotate-180"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
            Back
          </Link>
          <h2 className="card-title mb-0">Expense details</h2>
        </div>
        <dl className="w-full py-6 px-3 my-4 rounded-box bg-base-200">
          <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-base-400">Description</dt>
            <dd className="mt-1 text-sm text-base-900 sm:mt-0 sm:col-span-2">
              {data.expense.description}
            </dd>
          </div>
          <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-base-400">Amount</dt>
            <dd className="mt-1 text-sm text-base-900 sm:mt-0 sm:col-span-2">
              {data.expense.amount} €
            </dd>
          </div>
          <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
            <dt className="text-sm font-medium text-base-400">User</dt>
            <dd className="mt-2 text-sm text-base-900 sm:mt-0 sm:col-span-2 flex items-center">
              <div className="rounded-full w-10 h-10 inline-flex justify-center items-center bg-white text-3xl mr-4">
                {data.expense.user.icon ?? data.expense.user.username[0]}
              </div>
              {data.expense.user.username}
            </dd>
          </div>
          <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-base-400">Date</dt>
            <dd className="mt-1 text-sm text-base-900 sm:mt-0 sm:col-span-2">
              {new Intl.DateTimeFormat("it", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(data.expense.createdAt))}
            </dd>
          </div>
        </dl>
        {data.isOwner && (
          <>
            <div className="flex justify-center align-center mt-6">
              <Link
                to={`/expenses/${data.expense.id}/edit`}
                className="btn btn-default mr-4"
              >
                Edit
              </Link>
              <label
                htmlFor="delete-expense-modal"
                className="btn btn-error modal-button"
              >
                Delete
              </label>
            </div>
            <input
              type="checkbox"
              id="delete-expense-modal"
              className="modal-toggle"
            />
            <div className="modal">
              <div className="modal-box absolute left-[10%] right-[10%] top-[40%] w-[80%] rounded-lg">
                <p>
                  Do you really want to delete your expense? Its data will be
                  permanently deleted.
                </p>
                <div className="modal-action">
                  <Form method="post">
                    <input type="hidden" name="_method" value="delete" />
                    <button type="submit" className="btn btn-error">
                      Delete
                    </button>
                  </Form>
                  <label htmlFor="delete-expense-modal" className="btn">
                    Cancel
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.expenseId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.expenseId} is not your sheet.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  const { expenseId } = useParams();
  return (
    <div className="error-container">{`There was an error loading expense by the id ${expenseId}. Sorry.`}</div>
  );
}
