import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/debts - List all debts with their payments
export async function GET() {
  try {
    const debts = await db.debt.findMany({
      where: { deletedAt: null },
      include: {
        payments: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error("[DEBTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/debts - Create a new debt
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, source, description, startDate } = body;

    if (!amount || !source) {
      return NextResponse.json({ error: "المبلغ والجهة مطلوبان" }, { status: 400 });
    }

    const debt = await db.debt.create({
      data: {
        amount: parseFloat(amount),
        source,
        description,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: "active"
      }
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error("[DEBTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
