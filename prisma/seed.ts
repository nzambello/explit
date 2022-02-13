import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const famiglia = await db.team.create({
    data: {
      id: "Famiglia",
      description: "La mia famiglia",
      icon: "♥️",
    },
  });
  const nicola = await db.user.create({
    data: {
      username: "nicola",
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
      teamId: famiglia.id,
      icon: "🧑‍💻",
    },
  });
  const shahra = await db.user.create({
    data: {
      username: "shahra",
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
      teamId: famiglia.id,
      icon: "💃",
    },
  });

  const expenses = [
    {
      description: "Spesa",
      amount: 100,
      userId: nicola.id,
      teamId: famiglia.id,
    },
    {
      description: "Spesa",
      amount: 70,
      userId: shahra.id,
      teamId: famiglia.id,
    },
    {
      description: "Affitto",
      amount: 500,
      userId: shahra.id,
      teamId: famiglia.id,
    },

    // transaction between users
    {
      description: "Affitto",
      amount: 250,
      userId: nicola.id,
      teamId: famiglia.id,
    },
    {
      description: "Affitto",
      amount: -250,
      userId: shahra.id,
      teamId: famiglia.id,
    },

    {
      description: "Cena",
      amount: 50,
      userId: nicola.id,
      teamId: famiglia.id,
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
