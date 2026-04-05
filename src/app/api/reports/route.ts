import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reports?month=2026-03
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: "2026-03"

    if (!month) {
      return NextResponse.json({ error: 'month parameter is required' }, { status: 400 })
    }

    // Parse month to get start and end dates
    const [yearStr, monthStr] = month.split('-')
    const year = parseInt(yearStr)
    const monthNum = parseInt(monthStr)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999)

    const baseWhere = { deletedAt: null }

    // 1. Course enrollments created that month (with course info)
    const enrollments = await db.courseEnrollment.findMany({
      where: {
        ...baseWhere,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Funded sales created that month (with account type info)
    const fundedSales = await db.fundedAccountSale.findMany({
      where: {
        ...baseWhere,
        soldAt: { gte: startDate, lte: endDate },
      },
      include: {
        student: { select: { id: true, name: true } },
        accountType: { select: { id: true, name: true, accountSize: true, sellingPrice: true, costPrice: true } },
      },
      orderBy: { soldAt: 'desc' },
    })

    // 3. Payments that month (with student info)
    const payments = await db.payment.findMany({
      where: { ...baseWhere, month },
      include: {
        student: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    })

    // 4. Expenses that month
    const expenses = await db.expense.findMany({
      where: { ...baseWhere, month },
      orderBy: { date: 'desc' },
    })

    // 5. New students that month
    const newStudents = await db.student.findMany({
      where: {
        ...baseWhere,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 6. New debts taken this month
    const newDebts = await db.debt.findMany({
      where: {
        ...baseWhere,
        startDate: { gte: startDate, lte: endDate },
      },
      orderBy: { startDate: 'desc' },
    })

    // 7. Debt repayments made this month
    const debtPayments = await db.debtPayment.findMany({
      where: {
        ...baseWhere,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        debt: { select: { id: true, source: true } },
      },
      orderBy: { date: 'desc' },
    })

    // 8. Partner incomes this month
    const partnerIncomes = await db.partnerIncome.findMany({
      where: {
        ...baseWhere,
        month,
      },
      include: {
        partner: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    })

    // Calculate totals
    const totalEnrollmentIncome = enrollments
      .filter(e => e.paymentStatus === 'paid' || e.paymentStatus === 'partial')
      .reduce((sum, e) => sum + e.amountPaid, 0)

    const totalFundedIncome = fundedSales
      .filter(s => s.paymentStatus === 'paid' || s.paymentStatus === 'partial')
      .reduce((sum, s) => sum + s.amountPaid, 0)

    const totalFundedProfit = fundedSales
      .filter(s => s.paymentStatus === 'paid' || s.paymentStatus === 'partial')
      .reduce((sum, s) => sum + ((s.accountType?.sellingPrice || 0) - (s.accountType?.costPrice || 0)), 0)

    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
    const manualExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Debt and Partner Income
    const totalDebtReceived = newDebts
      .filter((d: any) => d.isCash) // include only cash-based debts in inflow
      .reduce((sum, d) => sum + d.amount, 0)
    const totalDebtRepayments = debtPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalPartnerIncome = partnerIncomes.reduce((sum, i) => sum + i.amount, 0)

    // Funded account costs (automatic expenses)
    const fundedCosts = fundedSales
      .filter(s => s.paymentStatus !== 'cancelled')
      .reduce((sum, s) => sum + (s.accountType?.costPrice || 0), 0)

    // Final Totals - Matching exactly what is shown in the lists
    const totalIncome = totalPayments + totalEnrollmentIncome + totalFundedIncome + totalDebtReceived + totalPartnerIncome
    const totalExpenses = manualExpenses + fundedCosts + totalDebtRepayments

    const categoryLabels: Record<string, string> = {
      rent: 'إيجارات',
      bills: 'فواتير',
      salaries: 'رواتب',
      marketing: 'تسويق',
      software: 'برمجيات',
      other: 'أخرى',
      funded_cost: 'تكاليف حسابات ممولة',
    }

    const expensesByCategory: Record<string, { label: string; items: any[]; total: number }> = {}
    expenses.forEach(exp => {
      if (!expensesByCategory[exp.category]) {
        expensesByCategory[exp.category] = {
          label: categoryLabels[exp.category] || exp.category,
          items: [],
          total: 0,
        }
      }
      expensesByCategory[exp.category].items.push(exp)
      expensesByCategory[exp.category].total += exp.amount
    })

    // Add funded costs as a category
    if (fundedCosts > 0) {
      expensesByCategory['funded_cost'] = {
        label: 'تكاليف حسابات ممولة',
        items: fundedSales
          .filter(s => s.paymentStatus !== 'cancelled' && (s.accountType?.costPrice || 0) > 0)
          .map(s => ({
            id: `fcost-${s.id}`,
            category: 'funded_cost',
            amount: s.accountType?.costPrice || 0,
            description: `تكلفة ${s.accountType?.name} - ${s.student?.name || ''}`,
            date: s.soldAt,
          })),
        total: fundedCosts,
      }
    }

    // Add debt repayments as a category (for detail breakdown, not for P&L totalExpenses)
    if (totalDebtRepayments > 0) {
      expensesByCategory['debt_payment'] = {
        label: 'سداد ديون',
        items: debtPayments.map(p => ({
          id: `dpay-${p.id}`,
          category: 'debt_payment',
          amount: p.amount,
          description: `سداد لـ: ${p.debt?.source || 'دين'} - ${p.notes || ''}`,
          date: p.date,
        })),
        total: totalDebtRepayments,
      }
    }

    // Net result
    const netProfit = totalIncome - totalExpenses

    return NextResponse.json({
      month,
      year,
      monthNum,
      totals: {
        enrollmentIncome: totalEnrollmentIncome,
        fundedIncome: totalFundedIncome,
        manualExpenses,
        fundedCosts,
        totalIncome,
        totalExpenses,
        netProfit,
        totalDebtReceived,
        totalDebtRepayments,
        totalPartnerIncome,
        newStudentsCount: newStudents.length,
      },
      enrollments,
      fundedSales,
      payments,
      expenses,
      expensesByCategory,
      newStudents,
      newDebts,
      debtPayments,
      partnerIncomes,
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 })
  }
}