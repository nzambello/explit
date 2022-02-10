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

type LoaderData = { expense: Expense; user: User; isOwner: boolean };

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
  });
  if (!expense) {
    throw new Response("What an expense! Not found.", {
      status: 404,
    });
  }
  const expenseUser = await db.user.findUnique({
    where: { id: expense.userId },
  });
  if (!expenseUser) {
    throw new Response("Oupsie! Not found.", {
      status: 500,
    });
  }
  const data: LoaderData = {
    expense,
    user: expenseUser,
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
    <div>
      <p>Description: {data.expense.description}</p>
      <p>Amount: {data.expense.amount}€</p>
      <p>User: {data.user.username}</p>
      {data.isOwner && (
        <form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button">
            Delete
          </button>
        </form>
      )}
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
