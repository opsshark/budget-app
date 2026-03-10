import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const transactions = await prisma.transaction.findMany({
    include: { category: true, account: true },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { amount, type, description, date, accountId, categoryId } = body;

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      description,
      date: new Date(date),
      accountId,
      categoryId,
    },
    include: { category: true, account: true },
  });

  // Update account balance
  const balanceChange = type === "income" ? parseFloat(amount) : -parseFloat(amount);
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: { increment: balanceChange } },
  });

  return NextResponse.json(transaction, { status: 201 });
}
