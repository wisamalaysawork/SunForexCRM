import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: "2026-03"

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
        paymentStatus: 'paid',
        ...(month && { createdAt: { gte: new Date(`${month}-01`) } }),
      },
      _sum: { amountPaid: true },
    })

    const fundedSalesRevenue = await db.fundedAccountSale.aggregate({
      where: {
        ...baseWhere,
        paymentStatus: 'paid',
        ...(month && { createdAt: { gte: new Date(`${month}-01`) } }),
      },
      _sum: { amountPaid: true },
    })

    const partnerIncome = await db.partnerIncome.aggregate({
      where: month ? { ...baseWhere, month } : baseWhere,
      _sum: { amount: true },
    })

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
      (partnerIncome._sum.amount || 0)
    const expenses = totalExpenses._sum.amount || 0
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
          total: totalIncome,
        },
        expenses: {
          total: expenses,
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
