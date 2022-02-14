import type { LoaderFunction } from "remix";
import { useLoaderData, useCatch, redirect } from "remix";
import type { Team, User } from "@prisma/client";
import { getUser } from "~/utils/session.server";
import Header from "~/components/Header";

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

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

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
