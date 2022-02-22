import type { User, Team, Expense } from "@prisma/client";
import type { LoaderFunction } from "remix";
import { redirect, useLoaderData, useCatch, Link } from "remix";
import { db } from "~/utils/db.server";
import { getUser, requireUserId } from "~/utils/session.server";
import Header from "../components/Header";

type LoaderData = {
  user: (User & { team: Team & { members: User[] } }) | null;
  thisMonth: {
    count: number;
    amount: number;
  };
  count: number;
  avg: number;
  statsByMonth: {
    [month: string]: {
      count: number;
      amount: number;
    };
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = requireUserId(request);
  const user = await getUser(request);
  if (!user?.id || !userId) {
    return redirect("/login");
  }

  const expenses = await db.expense.aggregate({
    _avg: {
      amount: true,
    },
    _count: {
      _all: true,
    },
    where: { userId: user.id },
    orderBy: {
      createdAt: "asc",
    },
  });

  let thisMonth = new Date();
  thisMonth.setDate(0);
  const thisMonthExp = await db.expense.aggregate({
    _avg: {
      amount: true,
    },
    _count: {
      _all: true,
    },
    where: { userId: user.id, createdAt: { gt: thisMonth } },
    orderBy: {
      createdAt: "asc",
    },
  });

  const allExpenses = await db.expense.findMany({
    where: { userId: user.id },
  });

  const statsByMonth = allExpenses.reduce(
    (
      acc: { [key: string]: { count: number; amount: number } },
      exp: Expense
    ) => {
      const month = new Intl.DateTimeFormat("it", {
        month: "2-digit",
        year: "numeric",
      }).format(new Date(exp.createdAt));
      if (!acc[month]) {
        acc[month] = {
          count: 0,
          amount: 0,
        };
      }

      acc[month].count += 1;
      acc[month].amount += exp.amount;
      return acc;
    },
    {}
  );

  const data: LoaderData = {
    user,
    thisMonth: {
      count: thisMonthExp?._count?._all ?? 0,
      amount: thisMonthExp?._avg?.amount ?? 0,
    },
    count: expenses._count._all ?? 0,
    avg: expenses._avg?.amount ?? 0,
    statsByMonth,
  };
  return data;
};

export default function ListExpensesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <Header user={data.user} route="/expenses" />
      <main className="container mx-auto">
        <h1 className="mb-10 mt-6 text-4xl font-bold">Statistics</h1>

        <div className="shadow-xl flex flex-wrap w-full rounded-box bg-base-100 overflow-hidden">
          <div className="stat w-full sm:w-1/2 md:w-1/3">
            <div className="stat-title">Expenses count</div>
            <div className="stat-value">{data.count}</div>
            <div className="stat-desc"></div>
          </div>

          <div className="stat w-full sm:w-1/2 md:w-1/3">
            <div className="stat-title">Average per month</div>
            <div className="stat-value">{data.avg.toFixed(2)} €</div>
          </div>

          <div className="stat w-full sm:w-1/2 md:w-1/3">
            <div className="stat-title">This month</div>
            <div className="stat-value">
              {data.thisMonth.amount.toFixed(2)} €
            </div>
            <div className="stat-desc">{data.thisMonth.count} expenses</div>
          </div>
        </div>

        <h2 className="mt-12 mb-8 text-2xl font-bold">Expenses by month</h2>
        <div className="shadow-xl bg-base-100 rounded-box overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(data.statsByMonth)?.map((month) => (
                  <tr key={month}>
                    <td className="capitalize">{month}</td>
                    <td>{data.statsByMonth[month].amount} €</td>
                    <td>{data.statsByMonth[month].count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return redirect("/login");
  }
  if (caught.status === 404) {
    return <div className="error-container">There is no data to display.</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
