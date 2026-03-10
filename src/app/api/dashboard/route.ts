import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Total balance across all accounts
  const accounts = await prisma.account.findMany();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // This month's income and expenses
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const monthIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Spending by category this month
  const spendingByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "expense",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const categorySpending = spendingByCategory.map((s) => ({
    category: categoryMap[s.categoryId],
    amount: s._sum.amount || 0,
  }));

  // Recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    include: { category: true, account: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalBalance,
    monthIncome,
    monthExpenses,
    categorySpending,
    recentTransactions,
  });
}
