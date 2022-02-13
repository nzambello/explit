import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useCatch, redirect } from "remix";
import type { Expense, User } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import Group from "~/icons/Group";

type LoaderData = { lastExpenses: (Expense & { user: User })[]; user: User };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  const lastExpenses = await db.expense.findMany({
    include: {
      user: true,
    },
    take: 25,
    orderBy: { createdAt: "desc" },
    where: { teamId: user.teamId },
  });

  const data: LoaderData = { lastExpenses, user };
  return data;
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="card shadow-lg compact side bg-base-100">
        <div className="flex-column items-center card-body">
          <h2 className="card-title">Last expenses</h2>
          {data.lastExpenses?.map((exp) => (
            <div className="flex w-full items-center mb-2" key={exp.id}>
              <div className="rounded-full w-10 h-10 inline-flex justify-center items-center bg-white text-3xl">
                {exp.user.icon ?? exp.user.username[0]}
              </div>
              <div className="font-bold w-16 ml-2 text-right">
                <span
                  className={`${
                    exp.amount > 0 ? "text-error" : "text-success"
                  }`}
                >
                  {-exp.amount} €
                </span>
              </div>
              <div className="grow ml-3">{exp.description}</div>
            </div>
          ))}
          <Link to="list" className="btn">
            <span>See all</span>
          </Link>
        </div>
      </div>
      <div className="card shadow-lg compact side bg-base-100">
        <div className="flex-row items-center space-x-4 card-body">
          <h2 className="card-title">Who needs to pay who</h2>
        </div>
      </div>
      <div className="card shadow-lg compact side bg-base-100">
        <div className="flex-row items-center justify-center space-x-4 card-body">
          <Link to="new" className="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block mr-2 w-6 h-6 stroke-current rotate-45"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            <span className="hidden lg:inline-block">Add an expense</span>
          </Link>
        </div>
      </div>
      <div className="card shadow-lg compact side bg-base-100">
        <div className="flex-row items-center justify-center space-x-4 card-body">
          <Link to="new" className="btn btn-primary">
            <Group className="inline-block mr-2 w-6 h-6 stroke-current" />
            <span className="hidden lg:inline-block">Trasfer</span>
          </Link>
        </div>
      </div>
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
