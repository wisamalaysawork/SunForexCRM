import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/reset - Clear all data from the database
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || body.confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json({ error: 'Confirmation string "DELETE_ALL_DATA" required' }, { status: 400 })
    }

    // Delete in correct order using a transaction for atomicity
    await db.$transaction([
      db.payment.deleteMany({}),
      db.courseEnrollment.deleteMany({}),
      db.fundedAccountSale.deleteMany({}),
      db.partnerIncome.deleteMany({}),
      db.partner.deleteMany({}),
      db.expense.deleteMany({}),
      db.student.deleteMany({}),
      db.course.deleteMany({}),
      db.fundedAccountType.deleteMany({}),
    ])

    return NextResponse.json({ success: true, message: 'تم مسح جميع البيانات بنجاح' })
  } catch (error: any) {
    console.error('Reset error:', error)
    return NextResponse.json({ 
      error: 'فشل في مسح البيانات',
      details: error.message || String(error)
    }, { status: 500 })
  }
}
