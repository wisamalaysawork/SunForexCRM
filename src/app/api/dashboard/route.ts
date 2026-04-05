import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: "2026-03"

    let startDate: Date | undefined
    let endDate: Date | undefined
    if (month) {
      const [yearStr, monthStr] = month.split('-')
      const yearInt = parseInt(yearStr, 10)
      const monthInt = parseInt(monthStr, 10)
      startDate = new Date(yearInt, monthInt - 1, 1)
      endDate = new Date(yearInt, monthInt, 1)
    }

    const baseWhere = { deletedAt: null }

    // ============ Students Metrics ============
    const totalStudents = await db.student.count({ where: baseWhere })
    const activeStudents = await db.student.count({
      where: { ...baseWhere, status: 'active' },
    })
    const inactiveStudents = await db.student.count({
      where: { ...baseWhere, status: 'inactive' },
    })

    // ============ Courses Metrics ============
    const totalCourses = await db.course.count({ where: baseWhere })
    const activeCourses = await db.course.count({
      where: { ...baseWhere, isActive: true },
    })

    // ============ Course Enrollments Metrics ============
    const totalEnrollments = await db.courseEnrollment.count({ where: baseWhere })
    const paidEnrollments = await db.courseEnrollment.count({
      where: { ...baseWhere, paymentStatus: 'paid' },
    })
    const pendingEnrollments = await db.courseEnrollment.count({
      where: { ...baseWhere, paymentStatus: 'pending' },
    })

    // ============ Funded Accounts Metrics ============
    const totalFundedSales = await db.fundedAccountSale.count({
      where: baseWhere,
    })
    const paidFundedSales = await db.fundedAccountSale.count({
      where: { ...baseWhere, paymentStatus: 'paid' },
    })

    // ============ Revenue Metrics ============
    const totalRevenue = await db.payment.aggregate({
      where: month ? { ...baseWhere, month } : baseWhere,
      _sum: { amount: true },
    })

    const enrollmentRevenue = await db.courseEnrollment.aggregate({
      where: {
        ...baseWhere,
        paymentStatus: { in: ['paid', 'partial'] },
        ...(month && { createdAt: { gte: startDate, lt: endDate } }),
      },
      _sum: { amountPaid: true },
    })

    const fundedSalesRevenue = await db.fundedAccountSale.aggregate({
      where: {
        ...baseWhere,
        paymentStatus: { in: ['paid', 'partial'] },
        ...(month && { soldAt: { gte: startDate, lt: endDate } }),
      },
      _sum: { amountPaid: true },
    })

    const fundedSalesCostArray = await db.fundedAccountSale.findMany({
      where: {
        ...baseWhere,
        paymentStatus: { not: 'cancelled' },
        ...(month && { soldAt: { gte: startDate, lt: endDate } }),
      },
      select: {
        accountType: {
          select: { costPrice: true }
        }
      }
    })
    const fundedCosts = fundedSalesCostArray.reduce((sum, sale) => sum + (sale.accountType?.costPrice || 0), 0)

    // ============ Expenses Metrics ============
    const totalExpenses = await db.expense.aggregate({
      where: month ? { ...baseWhere, month } : baseWhere,
      _sum: { amount: true },
    })

    const expensesByCategory = await db.expense.groupBy({
      by: ['category'],
      where: month ? { ...baseWhere, month } : baseWhere,
      _sum: { amount: true },
      _count: true,
    })

    // ============ Partner Income & Debts ============
    const partnerIncome = await db.partnerIncome.aggregate({
      where: month ? { ...baseWhere, month } : baseWhere,
      _sum: { amount: true },
    })

    const debtReceived = await db.debt.aggregate({
      where: month ? { ...baseWhere, startDate: { gte: startDate, lt: endDate } } : baseWhere,
      _sum: { amount: true },
    })

    const debtRepayments = await db.debtPayment.aggregate({
      where: month ? { ...baseWhere, date: { gte: startDate, lt: endDate } } : baseWhere,
      _sum: { amount: true },
    })

    const recentStudents = await db.student.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentFundedSales = await db.fundedAccountSale.findMany({
      where: baseWhere,
      include: {
        accountType: true,
        student: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const accountTypes = await db.fundedAccountType.findMany({
      where: baseWhere,
      include: {
        _count: {
          select: { sales: true }
        }
      }
    })

    // ============ Profit Calculation ============
    const totalIncome =
      (totalRevenue._sum.amount || 0) +
      (enrollmentRevenue._sum.amountPaid || 0) +
      (fundedSalesRevenue._sum.amountPaid || 0) +
      (partnerIncome._sum.amount || 0) +
      (debtReceived._sum.amount || 0)

    const expenses = (totalExpenses._sum.amount || 0) + fundedCosts + (debtRepayments._sum.amount || 0)
    const profit = totalIncome - expenses

    return NextResponse.json({
      period: month || 'all-time',
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
      },
      courses: {
        total: totalCourses,
        active: activeCourses,
      },
      enrollments: {
        total: totalEnrollments,
        paid: paidEnrollments,
        pending: pendingEnrollments,
      },
      fundedAccounts: {
        totalSales: totalFundedSales,
        paidSales: paidFundedSales,
        accountTypes,
      },
      recentStudents,
      recentFundedSales,
      financials: {
        income: {
          payments: totalRevenue._sum.amount || 0,
          enrollments: enrollmentRevenue._sum.amountPaid || 0,
          fundedSales: fundedSalesRevenue._sum.amountPaid || 0,
          partners: partnerIncome._sum.amount || 0,
          debts: debtReceived._sum.amount || 0,
          total: totalIncome,
        },
        expenses: {
          total: expenses,
          debtRepayments: debtRepayments._sum.amount || 0,
          byCategory: expensesByCategory,
        },
        profit,
      },
    })
  } catch (error) {
    console.error('[dashboard-error]', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
