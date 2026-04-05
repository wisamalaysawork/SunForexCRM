import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { ExpenseSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/expenses?month=2026-03
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    const where: any = { deletedAt: null }
    if (month) where.month = month

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ExpenseSchema.parse(body)

    const expenseDate = new Date(validated.date)
    const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`

    const expense = await db.expense.create({
      data: {
        category: validated.category,
        amount: validated.amount,
        description: validated.description,
        date: expenseDate,
        month,
        isPaid: validated.isPaid ?? true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 400 })
  }
}

// PUT /api/expenses
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    // allow partial updates
    const validated = ExpenseSchema.partial().parse(rest)

    const updateData: any = { ...validated }
    if (validated.date) {
      const expenseDate = new Date(validated.date)
      updateData.date = expenseDate
      updateData.month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`
    }

    const expense = await db.expense.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update expense' }, { status: 400 })
  }
}

// DELETE /api/expenses?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.expense.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}