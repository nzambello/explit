import type { Expense, User } from "@prisma/client";
import type { LinksFunction, LoaderFunction } from "remix";
import { Link, Outlet, useLoaderData, Form, redirect } from "remix";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => {
  return [];
};

type LoaderData = {
  user: User | null;
  expenseListItems: Array<Expense>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    redirect("/login");
  }

  const expenseListItems = await db.expense.findMany({
    take: 25,
    orderBy: { createdAt: "desc" },
  });

  const data: LoaderData = {
    expenseListItems,
    user,
  };
  return data;
};

export default function ExpensesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="expenses-layout">
      <header className="expenses-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/">
              <span>Expenses</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jexpensesokes-main">
        <div className="container">
          <div className="expenses-list">
            <p>Last expenses:</p>
            <ul>
              {data.expenseListItems.map((exp) => (
                <li key={exp.id}>
                  <Link prefetch="intent" to={exp.id}>
                    {exp.amount}€ - {exp.description}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="expenses-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
