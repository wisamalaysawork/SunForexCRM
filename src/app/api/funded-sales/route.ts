import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// GET /api/funded-sales?studentId=xxx&accountTypeId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const accountTypeId = searchParams.get('accountTypeId')

    const where: any = { deletedAt: null }
    if (studentId) where.studentId = studentId
    if (accountTypeId) where.accountTypeId = accountTypeId

    const sales = await db.fundedAccountSale.findMany({
      where,
      include: { student: true, accountType: true },
      orderBy: { soldAt: 'desc' },
    })

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch funded sales' }, { status: 500 })
  }
}

// POST /api/funded-sales
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, accountTypeId, paymentStatus, amountPaid, notes } = body

    if (!studentId || !accountTypeId) {
      return NextResponse.json({ error: 'Student ID and Account Type ID are required' }, { status: 400 })
    }

    // Get account type to check existence
    const accountType = await db.fundedAccountType.findUnique({ where: { id: accountTypeId } })
    if (!accountType) {
      return NextResponse.json({ error: 'Account type not found' }, { status: 404 })
    }

    const sale = await db.fundedAccountSale.create({
      data: {
        studentId,
        accountTypeId,
        paymentStatus: paymentStatus || 'pending',
        amountPaid: Number(amountPaid) || 0,
        notes,
      },
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create funded sale' }, { status: 500 })
  }
}

// PUT /api/funded-sales
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, paymentStatus, amountPaid, notes } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const sale = await db.fundedAccountSale.update({
      where: { id },
      data: {
        paymentStatus,
        amountPaid: Number(amountPaid) || 0,
        notes,
      },
    })

    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update funded sale' }, { status: 500 })
  }
}

// DELETE /api/funded-sales?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.fundedAccountSale.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete funded sale' }, { status: 500 })
  }
}
