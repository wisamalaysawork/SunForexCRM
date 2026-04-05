import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseWhere = { deletedAt: null };

    // 1. All manual payments registered
    const payments = await db.payment.findMany({ where: baseWhere });
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    // 2. All course enrollments paid amounts
    const enrollments = await db.courseEnrollment.findMany({ where: baseWhere });
    const totalEnrollmentIncome = enrollments
      .filter(e => e.paymentStatus === 'paid' || e.paymentStatus === 'partial')
      .reduce((sum, e) => sum + e.amountPaid, 0);

    // 3. All funded accounts paid amounts
    const fundedSales = await db.fundedAccountSale.findMany({ 
      where: baseWhere,
      include: { accountType: true }
    });
    const totalFundedIncome = fundedSales
      .filter(s => s.paymentStatus === 'paid' || s.paymentStatus === 'partial')
      .reduce((sum, s) => sum + s.amountPaid, 0);

    const fundedCosts = fundedSales
      .filter(s => s.paymentStatus !== 'cancelled')
      .reduce((sum, s) => sum + (s.accountType?.costPrice || 0), 0);

    // 4. Partner Incomes
    const partnerIncomes = await db.partnerIncome.findMany({ where: baseWhere });
    const totalPartnerIncome = partnerIncomes.reduce((sum, i) => sum + i.amount, 0);

    // 5. Cash Debts Received
    const debts = await db.debt.findMany({ where: baseWhere });
    const totalCashDebtsReceived = debts
      .filter(d => d.isCash)
      .reduce((sum, d) => sum + d.amount, 0);

    // 6. Paid Expenses
    const expenses = await db.expense.findMany({ where: baseWhere });
    const totalPaidExpenses = expenses
      .filter(e => e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    // 7. Debt Payments
    const debtPayments = await db.debtPayment.findMany({ where: baseWhere });
    const totalDebtPayments = debtPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculations
    const cashIn = totalPayments + totalEnrollmentIncome + totalFundedIncome + totalPartnerIncome + totalCashDebtsReceived;
    const cashOut = totalPaidExpenses + fundedCosts + totalDebtPayments;
    const balance = cashIn - cashOut;

    return NextResponse.json({
      cashIn,
      cashOut,
      balance,
      details: {
        totalPayments,
        totalEnrollmentIncome,
        totalFundedIncome,
        totalPartnerIncome,
        totalCashDebtsReceived,
        totalPaidExpenses,
        fundedCosts,
        totalDebtPayments
      }
    });

  } catch (error) {
    console.error("[TREASURY_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
