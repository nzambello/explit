import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { deleteUser } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  return deleteUser(request);
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
