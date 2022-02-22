import type { User, Team, Expense } from "@prisma/client";
import type { LoaderFunction } from "remix";
import { redirect, useLoaderData, useCatch, Link, Form } from "remix";
import Filter from "~/icons/Filter";
import { db } from "~/utils/db.server";
import { getUser, requireUserId } from "~/utils/session.server";

type LoaderData = {
  user: (User & { team: Team & { members: User[] } }) | null;
  expenses: (Expense & { user: User & { team: Team } })[];
  expensesCount: number;
  page: number;
  filters: {
    description: string | null | undefined;
    dateFrom: string | null | undefined;
    dateTo: string | null | undefined;
    user: string | null | undefined;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = requireUserId(request);
  const user = await getUser(request);
  if (!user?.id || !userId) {
    return redirect("/login");
  }

  const expensesCount = await db.expense.count({
    where: { teamId: user.teamId },
  });

  const searchParams = new URL(request.url)?.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const description = searchParams.get("description");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const userIdParam = searchParams.get("user");

  const filters = {
    description:
      description && description.length > 0 ? description : undefined,
    dateFrom: dateFrom && dateFrom.length > 0 ? dateFrom : undefined,
    dateTo: dateTo && dateTo.length > 0 ? dateTo : undefined,
    user: userIdParam && userIdParam?.length > 0 ? userIdParam : undefined,
  };
  const expensesFilters = {
    ...(filters.description && {
      description: { contains: filters.description },
    }),
    ...((filters.dateFrom || filters.dateTo) && {
      createdAt: {
        ...(filters.dateFrom && {
          gte: new Date(`${filters.dateFrom}T00:00:00+0100`),
        }),
        ...(filters.dateTo && {
          lte: new Date(`${filters.dateTo}T00:00:00+0100`),
        }),
      },
    }),
    ...(filters.user && { userId: filters.user }),
  };
  console.log("FILTERS", filters);

  const expenses = await db.expense.findMany({
    where: {
      teamId: user.teamId,
      ...expensesFilters,
    },
    take: 10,
    skip: (page - 1) * 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        include: {
          team: true,
        },
      },
    },
  });

  const data: LoaderData = {
    user,
    expenses,
    expensesCount,
    page,
    filters,
  };
  return data;
};

export default function ListExpensesRoute() {
  const data = useLoaderData<LoaderData>();

  const hasFilters = Object.values(data.filters).some(
    (value) => value !== undefined && value !== null
  );

  return (
    <>
      <h1 className="mb-6 mt-6 text-4xl font-bold">List expenses</h1>

      <label htmlFor="filters-modal" className="btn modal-button">
        <Filter
          className={`w-6 h-6 mr-2${hasFilters ? " text-primary" : ""}`}
          active={hasFilters}
        />
        Filters
      </label>

      <input type="checkbox" id="filters-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h2 className="font-bold text-lg">Filters</h2>
          <Form className="my-4">
            <div className="form-control w-full max-w-xs mb-4">
              <label className="label" htmlFor="filter-description">
                <span className="label-text">Text</span>
              </label>
              <input
                type="text"
                id="filter-description"
                name="description"
                placeholder="Search by description"
                className="input input-bordered w-full max-w-xs"
                defaultValue={data.filters.description ?? ""}
              />
            </div>
            <div className="form-control w-full max-w-xs mb-4">
              <label className="label" htmlFor="filter-dateFrom">
                <span className="label-text">Date from</span>
              </label>
              <input
                type="date"
                id="filter-dateFrom"
                name="dateFrom"
                placeholder={new Intl.DateTimeFormat("it", {
                  dateStyle: "short",
                }).format(new Date())}
                className="input input-bordered w-full max-w-xs"
                defaultValue={data.filters.dateFrom ?? ""}
              />
            </div>
            <div className="form-control w-full max-w-xs mb-4">
              <label className="label" htmlFor="filter-dateTo">
                <span className="label-text">Date to</span>
              </label>
              <input
                type="date"
                id="filter-dateTo"
                name="dateTo"
                placeholder={new Intl.DateTimeFormat("it", {
                  dateStyle: "short",
                }).format(new Date())}
                className="input input-bordered w-full max-w-xs"
                defaultValue={data.filters.dateTo ?? ""}
              />
            </div>
            <div className="form-control w-full max-w-xs mb-4">
              <label className="label" htmlFor="filter-user">
                <span className="label-text">User</span>
              </label>
              <select
                name="user"
                id="filter-user"
                className="select select-bordered w-full max-w-xs"
                defaultValue={data.filters.user ?? ""}
              >
                <option value="">Choose an user</option>
                {data.user?.team?.members?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 text-center">
              <label htmlFor="filters-modal" className="btn btn-default mr-4">
                Close
              </label>
              <Link to={`?page=${data.page}`} className="btn btn-default mr-4">
                Clear
              </Link>
              <button type="submit" className="btn btn-primary">
                Apply
              </button>
            </div>
          </Form>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 shadow-xl rounded-box mt-6 mb-10">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>User</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.expenses?.map((exp) => (
              <tr key={exp.id}>
                <td className="sticky left-0 z-10 shadow-lg">
                  <Link
                    to={`/expenses/${exp.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    See
                  </Link>
                </td>
                <td>
                  {new Intl.DateTimeFormat("it", {
                    dateStyle: "short",
                  }).format(new Date(exp.createdAt))}
                </td>
                <td>{exp.user.username}</td>
                <td>{exp.amount} €</td>
                <td>{exp.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.expensesCount > 10 && (
        <div className="btn-group justify-center my-8">
          {[...new Array(Math.ceil(data.expensesCount / 10)).keys()].map(
            (p) => (
              <Link
                to={`?page=${p + 1}`}
                key={p}
                className={`btn${data.page === p + 1 ? " btn-active" : ""}`}
              >
                {p + 1}
              </Link>
            )
          )}
        </div>
      )}
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
