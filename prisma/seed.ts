import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Housing", icon: "home", color: "#3B82F6" },
    { name: "Food & Dining", icon: "utensils", color: "#F59E0B" },
    { name: "Transportation", icon: "car", color: "#8B5CF6" },
    { name: "Entertainment", icon: "tv", color: "#EC4899" },
    { name: "Shopping", icon: "shopping-bag", color: "#10B981" },
    { name: "Utilities", icon: "zap", color: "#F97316" },
    { name: "Healthcare", icon: "heart", color: "#EF4444" },
    { name: "Income", icon: "wallet", color: "#22C55E" },
    { name: "Savings", icon: "piggy-bank", color: "#06B6D4" },
    { name: "Other", icon: "tag", color: "#6B7280" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const existing = await prisma.account.findFirst({
    where: { name: "Checking" },
  });

  if (!existing) {
    await prisma.account.create({
      data: { name: "Checking", type: "checking", balance: 0 },
    });
  }

  console.log("Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
