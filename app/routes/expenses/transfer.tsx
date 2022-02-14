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
import { requireUserId, getUserId } from "~/utils/session.server";

function validateExpenseDescription(description: string) {
  if (description.length < 2) {
    return `That expense's description is too short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    description: string | undefined;
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
  const form = await request.formData();
  const description = form.get("description");
  const amount = form.get("amount");
  if (typeof description !== "string" || typeof amount !== "number") {
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
    data: { ...fields, userId: userId },
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
    <div>
      <p>Add an expense</p>
      <Form method="post">
        <div>
          <label>
            Description:{" "}
            <input
              type="text"
              name="description"
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
          </label>
          {actionData?.fieldErrors?.description && (
            <p
              className="form-validation-error"
              role="alert"
              id="description-error"
            >
              {actionData.fieldErrors.description}
            </p>
          )}
        </div>
        <div>
          <label>
            Amount:{" "}
            <input
              type="number"
              name="content"
              defaultValue={actionData?.fields?.amount}
            />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
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
