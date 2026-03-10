import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const budgets = await prisma.budget.findMany({
    where: { month, year },
    include: { category: true },
  });

  // Get actual spending for each budget category
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const spending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "expense",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const spendingMap = Object.fromEntries(
    spending.map((s) => [s.categoryId, s._sum.amount || 0])
  );

  const budgetsWithSpending = budgets.map((b) => ({
    ...b,
    spent: spendingMap[b.categoryId] || 0,
  }));

  return NextResponse.json(budgetsWithSpending);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { amount, month, year, categoryId } = body;

  const budget = await prisma.budget.upsert({
    where: {
      categoryId_month_year: { categoryId, month, year },
    },
    update: { amount: parseFloat(amount) },
    create: {
      amount: parseFloat(amount),
      month,
      year,
      categoryId,
    },
    include: { category: true },
  });

  return NextResponse.json(budget, { status: 201 });
}
