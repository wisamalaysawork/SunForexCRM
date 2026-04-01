import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/debts/payments?month=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // For now, we'll fetch all and filter by month if provided, 
    // or we can use a more complex query if we want to optimize.
    // Given the small scale, fetching all for the debt and filtering is fine, 
    // but a direct month filter on payments is better if we had a month column.
    
    // Let's check if we should add a 'month' column to DebtPayment too.
    // Actually, we can just filter by date range.
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (month) {
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 1);
    }

    const payments = await db.debtPayment.findMany({
      where: {
        deletedAt: null,
        ...(month && {
          date: {
            gte: startDate!,
            lt: endDate!
          }
        })
      },
      include: {
        debt: true
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("[DEBT_PAYMENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
