import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/student/[id] - Fetch a single student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await db.student.findUnique({
      where: { id, deletedAt: null },
      include: {
        courseEnrollments: { where: { deletedAt: null }, include: { course: true } },
        fundedAccountSales: { where: { deletedAt: null }, include: { accountType: true } },
        payments: { where: { deletedAt: null }, select: { amount: true } },
        _count: { select: { payments: { where: { deletedAt: null } } } },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'لم يتم العثور على الطالب' }, { status: 404 })
    }

    const { payments, ...rest } = student
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({ ...rest, totalPaid })
  } catch (error) {
    return NextResponse.json({ error: 'فشل في تحميل الطالب' }, { status: 500 })
  }
}