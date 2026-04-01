import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { PaymentSchema } from '@/lib/schemas'

// GET /api/payments?studentId=xxx&month=2026-03
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const month = searchParams.get('month')

    const where: any = { deletedAt: null }
    if (studentId) where.studentId = studentId
    if (month) where.month = month

    const payments = await db.payment.findMany({
      where,
      include: { student: true },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST /api/payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = PaymentSchema.parse(body)

    const paymentDate = validated.date ? new Date(validated.date) : new Date()
    const monthStr = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`

    const payment = await db.payment.create({
      data: {
        studentId: validated.studentId,
        amount: validated.amount,
        method: validated.method,
        description: validated.description,
        date: paymentDate,
        month: monthStr,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create payment' }, { status: 400 })
  }
}

// DELETE /api/payments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.payment.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
