import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/debts/[id]/payments - Add payment to debt
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { amount, date, notes } = body;

    if (!amount) {
      return NextResponse.json({ error: "مبلغ السداد مطلوب" }, { status: 400 });
    }

    const payment = await db.debtPayment.create({
      data: {
        debtId: id,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        notes
      }
    });

    // Check if debt is fully paid
    const debt = await db.debt.findUnique({
      where: { id, deletedAt: null },
      include: { payments: { where: { deletedAt: null } } }
    });

    if (debt) {
      const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= debt.amount) {
        await db.debt.update({
          where: { id },
          data: { status: "paid" }
        });
      }
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("[DEBT_PAYMENT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
