import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "remix";
import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

type RegisterForm = {
  username: string;
  password: string;
  icon?: string;
  teamId: string;
};

type UpdateUserForm = {
  id: string;
  password?: string;
  icon?: string;
  teamId?: string;
  avgIncome?: number;
};

export async function register({
  username,
  password,
  icon,
  teamId,
}: RegisterForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const team = await db.team.findUnique({ where: { id: teamId } });
  if (!team) {
    await db.team.create({
      data: {
        id: teamId,
        icon: teamId[0],
      },
    });
  }
  const user = await db.user.create({
    data: {
      username,
      passwordHash,
      icon: icon && icon.length > 0 ? icon : username[0],
      teamId,
    },
  });
  return user;
}

export async function updateUser({ id, ...data }: UpdateUserForm) {
  if (data.teamId) {
    const team = await db.team.findUnique({ where: { id: data.teamId } });
    if (!team) {
      await db.team.create({
        data: {
          id: data.teamId,
          icon: data.teamId[0],
        },
      });
    }
  }

  const passwordHash = await bcrypt.hash(data.password ?? "", 10);
  const user = await db.user.update({
    data: {
      ...(data?.icon ? { icon: data.icon } : {}),
      ...(data?.password ? { passwordHash } : {}),
      ...(data?.teamId ? { teamId: data.teamId } : {}),
      ...(data?.avgIncome ? { avgIncome: data.avgIncome } : {}),
    },
    where: { id },
  });
  return user;
}

export async function deleteUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const deletedUser = await db.user.delete({ where: { id: userId } });
  if (!deletedUser) return null;

  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function login({ username, password }: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function getUsersByTeam(request: Request) {
  const user = await getUser(request);
  if (!user) {
    return null;
  }

  try {
    const users = await db.user.findMany({
      where: { teamId: user.teamId },
    });
    return users;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
