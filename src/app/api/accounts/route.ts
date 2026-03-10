import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(accounts);
}
