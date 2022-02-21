import type { LoaderFunction, ActionFunction } from "remix";
import { useLoaderData, useCatch, redirect, Link, Form } from "remix";
import type { Team, User } from "@prisma/client";
import Header from "~/components/Header";
import { db } from "~/utils/db.server";
import { requireUserId, getUser } from "~/utils/session.server";

type LoaderData = {
  user: User & {
    team: Team & {
      members: User[];
    };
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  const data: LoaderData = { user };
  return data;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  if (form.get("_method") === "patch") {
    const userId = await requireUserId(request);
    const user = await getUser(request);

    const balanceByIncomeField = form.get("balanceByIncome");
    const balanceByIncome =
      typeof balanceByIncomeField === "boolean"
        ? balanceByIncomeField
        : typeof balanceByIncomeField === "string"
        ? Boolean(balanceByIncomeField)
        : false;

    const team = await db.team.findUnique({
      where: { id: user?.teamId },
    });
    if (!team) {
      throw new Response("Can't update what does not exist", { status: 404 });
    }
    if (user?.teamId !== team.id) {
      throw new Response("Pssh, nice try. That's not your expense", {
        status: 401,
      });
    }
    await db.team.update({ where: { id: team.id }, data: { balanceByIncome } });
    return redirect("/expenses");
  }
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  const allUsersHaveSetAvgIncome = data.user.team.members?.every(
    (m) => m.avgIncome && m.avgIncome > 0
  );

  return (
    <>
      <Header user={data.user} route="/account" />
      <main className="p-2 lg:py-4 lg:px-6">
        <h1 className="mb-8 lg:mb-10 text-2xl">
          Team: <strong className="text-primary">{data.user.team.id}</strong>
        </h1>
        {!data.user.team.members || data.user.team.members?.length === 0 ? (
          <p>No members</p>
        ) : (
          data.user.team.members.map((member) => (
            <div
              key={member.id}
              className="card shadow-lg compact side bg-base-100 mb-4"
            >
              <div className="flex-row items-center space-x-4 card-body">
                <div>
                  <div className="rounded-full w-10 h-10 m-1 inline-flex justify-center items-center bg-primary-content text-primary text-3xl">
                    {member.icon ?? member.username[0]}
                  </div>
                </div>
                <div>
                  <h2 className="card-title !mb-0">{member.username}</h2>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="mt-10">
          <h2 className="mb-4 text-xl">Balance based on income</h2>
          <p>
            To have an equal split based on everyone's income, you can select
            this option. If of two people, one earns 1.5 times as much as the
            other, then his or her share in the common expenses will be 1.5
            times as much as the other's.
          </p>
          <Form method="post">
            <input type="hidden" name="_method" value="patch" />
            <fieldset disabled={!allUsersHaveSetAvgIncome}>
              <div className="form-control mt-4">
                <label className="cursor-pointer label justify-start">
                  <input
                    type="checkbox"
                    name="balanceByIncome"
                    defaultChecked={data.user.team.balanceByIncome ?? false}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text ml-2">
                    Enable balance based on income
                  </span>
                </label>
              </div>
            </fieldset>
            {!allUsersHaveSetAvgIncome ? (
              <div className="alert shadow-lg">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info-content flex-shrink-0 w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    Not all users from this team set their average income.
                  </span>
                </div>
                <div className="flex-none">
                  <Link to="/account/manage" className="btn btn-sm">
                    Check in the Account page
                  </Link>
                </div>
              </div>
            ) : (
              <button type="submit" className="mt-6 btn btn-primary">
                Save
              </button>
            )}
          </Form>
        </div>
      </main>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">There are no users to display.</div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
