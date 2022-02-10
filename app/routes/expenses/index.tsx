import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useCatch } from "remix";
import type { Expense } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { lastExpenses: Expense[] };

export const loader: LoaderFunction = async () => {
  const lastExpenses = await db.expense.findMany({
    take: 25,
    orderBy: { createdAt: "desc" },
  });

  const data: LoaderData = { lastExpenses };
  return data;
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here show statistics</p>

      <Link to="new" className="btn btn-primary">
        Add an expense
      </Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

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
