import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const team = await db.team.create({
    data: {
      id: "Family",
      description: "My family",
      icon: "♥️",
    },
  });
  const user1 = await db.user.create({
    data: {
      username: "user1",
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u", // twixrox
      teamId: team.id,
      icon: "🧑‍💻",
      theme: "dark",
    },
  });
  const user2 = await db.user.create({
    data: {
      username: "user2",
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
      teamId: team.id,
      icon: "💃",
      theme: "emerald",
    },
  });

  const expenses = [
    {
      description: "Groceries",
      amount: 100,
      userId: user1.id,
      teamId: team.id,
    },
    {
      description: "Groceries",
      amount: 70,
      userId: user2.id,
      teamId: team.id,
    },
    {
      description: "Rent",
      amount: 500,
      userId: user2.id,
      teamId: team.id,
    },

    // transaction between users
    {
      description: "Rent",
      amount: 250,
      userId: user1.id,
      teamId: team.id,
    },
    {
      description: "Rent",
      amount: -250,
      userId: user2.id,
      teamId: team.id,
    },

    {
      description: "Dinner out",
      amount: 50,
      userId: user1.id,
      teamId: team.id,
    },
  ];

  await Promise.all(
    expenses.map((exp) => {
      const data = { ...exp };
      return db.expense.create({ data });
    })
  );
}

seed();
