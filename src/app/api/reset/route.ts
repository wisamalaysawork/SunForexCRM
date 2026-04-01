import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/reset - Clear all data from the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json({ error: 'Confirmation string required' }, { status: 400 })
    }

    // Delete in correct order (children first due to foreign keys)
    await db.payment.deleteMany({})
    await db.courseEnrollment.deleteMany({})
    await db.fundedAccountSale.deleteMany({})
    await db.partnerIncome.deleteMany({})
    await db.partner.deleteMany({})
    await db.expense.deleteMany({})
    await db.student.deleteMany({})
    await db.course.deleteMany({})
    await db.fundedAccountType.deleteMany({})

    return NextResponse.json({ success: true, message: 'تم مسح جميع البيانات بنجاح' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'فشل في مسح البيانات' }, { status: 500 })
  }
}
