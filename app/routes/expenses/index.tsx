import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useCatch, redirect } from "remix";
import type { Expense, User } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import Group from "~/icons/Group";

type LoaderData = {
  lastExpenses: (Expense & { user: User })[];
  user: User;
  teamCounts: {
    id: string;
    username: string;
    icon: string;
    count: number;
    spent: number;
    dueAmount: number;
  }[];
  totalExpenses: {
    count: number;
    amount: number;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  const lastExpenses = await db.expense.findMany({
    include: {
      user: true,
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    where: { teamId: user.teamId },
  });

  let teamExpenses = await db.expense.groupBy({
    by: ["userId"],
    _count: {
      _all: true,
    },
    _sum: {
      amount: true,
    },
    where: { user: { teamId: user.teamId } },
  });
  let expensesByUser = user.team.members.map((m) => ({
    id: m.id,
    username: m.username,
    icon: m.icon,
    count: teamExpenses.find((e) => e.userId === m.id)?._count?._all ?? 0,
    spent: teamExpenses.find((e) => e.userId === m.id)?._sum?.amount ?? 0,
    dueAmount: 0,
  }));
  let totalExpenses = expensesByUser.reduce(
    (acc, { count, spent }) => ({
      count: acc.count + count,
      amount: acc.amount + spent,
    }),
    { count: 0, amount: 0 }
  );
  const avgPerUser = totalExpenses.amount / user.team.members.length;
  let teamCounts = expensesByUser.map((userData) => ({
    ...userData,
    dueAmount: avgPerUser - userData.spent,
  }));

  const data: LoaderData = {
    lastExpenses,
    user,
    totalExpenses,
    teamCounts,
  };
  return data;
};

export default function ExpensesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 md:col-span-1 card shadow-lg compact side bg-base-100 order-last md:order-none">
        <div className="flex-column items-center card-body !py-6">
          <h2 className="card-title">Last expenses</h2>
          <ul className="list-none shadow-inner w-full rounded-lg p-4 my-4 mx-0 max-h-48 overflow-x-scroll">
            {data.lastExpenses?.map((exp) => (
              <li key={exp.id}>
                <Link
                  className="flex w-full items-center mb-3"
                  to={`/expenses/${exp.id}`}
                >
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
                  <div className="grow ml-3 flex flex-col justify-center items-start">
                    <span className="text-xs opacity-50">
                      {new Intl.DateTimeFormat("it", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(exp.createdAt))}
                    </span>
                    <span className="font-bold">{exp.description}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="list" className="btn">
            <span>See all</span>
          </Link>
        </div>
      </div>
      <div className="col-span-2 md:col-span-1 card shadow-lg compact side bg-base-100">
        <div className="flex-column items-center card-body !py-6">
          <h2 className="card-title">Who needs to pay who</h2>
          <div className="w-full shadow stats grid-cols-2 grid-flow-row-dense">
            {data.teamCounts?.map((user) => (
              <div className="stat col-span-1" key={user.id}>
                <div className="stat-figure text-info">
                  <div className="rounded-full shrink-0 w-4 sm:w-10 h-4 sm:h-10 inline-flex justify-center items-center bg-white text-3xl">
                    {user.icon ?? user.username[0]}
                  </div>
                </div>
                <div
                  className={`stat-value ${
                    user.dueAmount > 0 ? "text-error" : "text-success"
                  }`}
                >
                  {Math.abs(user.dueAmount)} €
                </div>
                <div className="stat-title text-lg">{user.username}</div>
                <div className="stat-desc text-info">
                  {user.dueAmount > 0
                    ? `${user.id === data.user.id ? "You owe" : "Owes"} others`
                    : `Others owe ${user.id === data.user.id ? "you" : ""}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card shadow-lg compact side md:bg-base-100 order-first md:order-none">
        <div className="flex-row items-center justify-center space-x-4 card-body">
          <Link
            to="new"
            className="btn btn-primary flex-wrap py-3 h-auto w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block lg:mr-2 w-6 h-6 stroke-current rotate-45"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            <span className="block w-full mt-2 lg:mt-0 lg:w-auto lg:inline-block">
              New
            </span>
          </Link>
        </div>
      </div>
      <div className="card shadow-lg compact side md:bg-base-100 order-first md:order-none">
        <div className="flex-row items-center justify-center space-x-4 card-body">
          <Link
            to="transfer"
            className="btn btn-primary flex-wrap py-3 h-auto w-full"
          >
            <Group className="inline-block lg:mr-2 w-6 h-6 stroke-current" />
            <span className="block w-full mt-2 lg:mt-0 lg:w-auto lg:inline-block">
              Trasfer
            </span>
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
