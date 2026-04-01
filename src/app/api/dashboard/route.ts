import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: "2026-03"

    const baseWhere = { deletedAt: null }
    
    // Calculate date range if month is provided
    let startDate: Date | null = null
    let endDate: Date | null = null
    if (month) {
      const [year, m] = month.split('-').map(Number)
      startDate = new Date(year, m - 1, 1)
      endDate = new Date(year, m, 1) // First day of next month
    }

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
        ...(month && { 
          createdAt: { 
            gte: startDate!, 
            lt: endDate! 
          } 
        }),
      },
      _sum: { amountPaid: true },
    })

    const fundedSalesRevenue = await db.fundedAccountSale.aggregate({
      where: {
        ...baseWhere,
        paymentStatus: 'paid',
        ...(month && { 
          createdAt: { 
            gte: startDate!, 
            lt: endDate! 
          } 
        }),
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

    const debtPayments = await db.debtPayment.aggregate({
      where: {
        ...baseWhere,
        ...(month && { 
          date: { 
            gte: startDate!, 
            lt: endDate! 
          } 
        }),
      },
      _sum: { amount: true },
    })

    // ============ Funded Costs (Cost Price) ============
    const monthFundedSalesData = await db.fundedAccountSale.findMany({
      where: {
        ...baseWhere,
        paymentStatus: { not: 'cancelled' },
        ...(month && { 
          createdAt: { 
            gte: startDate!, 
            lt: endDate! 
          } 
        }),
      },
      select: {
        accountType: {
          select: { costPrice: true }
        }
      }
    })
    const fundedCosts = monthFundedSalesData.reduce((sum, s) => sum + (s.accountType?.costPrice || 0), 0)


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
    const manualExpenses = totalExpenses._sum.amount || 0
    const debtRepayments = debtPayments._sum.amount || 0
    const totalExpensesWithCosts = manualExpenses + fundedCosts + debtRepayments
    const profit = totalIncome - totalExpensesWithCosts

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
          total: totalExpensesWithCosts,
          manual: manualExpenses,
          fundedCosts: fundedCosts,
          debtRepayments: debtRepayments,
          byCategory: [
            ...expensesByCategory,
            ...(fundedCosts > 0 ? [{ 
              category: 'funded_cost', 
              _sum: { amount: fundedCosts },
              _count: monthFundedSalesData.length 
            }] : []),
            ...(debtRepayments > 0 ? [{ 
              category: 'debt_payment', 
              _sum: { amount: debtRepayments },
              _count: 0 
            }] : [])
          ],
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
