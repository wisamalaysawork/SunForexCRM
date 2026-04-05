import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// PUT /api/debts/[id] - Update debt
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, source, description, status, startDate, isCash } = body;

    const debt = await db.debt.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(source && { source }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(isCash !== undefined && { isCash }),
      }
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error("[DEBT_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/debts/[id] - Soft delete debt
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.debt.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: "Debt deleted successfully" });
  } catch (error) {
    console.error("[DEBT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
