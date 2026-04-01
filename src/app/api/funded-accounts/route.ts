import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { FundedAccountTypeSchema } from '@/lib/schemas'

// GET /api/funded-accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const where: any = { deletedAt: null }
    if (active === 'true') where.isActive = true
    if (active === 'false') where.isActive = false

    const accounts = await db.fundedAccountType.findMany({
      where,
      include: {
        _count: { select: { sales: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch funded accounts' }, { status: 500 })
  }
}

// POST /api/funded-accounts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = FundedAccountTypeSchema.parse(body)

    const account = await db.fundedAccountType.create({
      data: validated,
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create account type' }, { status: 400 })
  }
}

// PUT /api/funded-accounts
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    // allow partial updates
    const validated = FundedAccountTypeSchema.partial().parse(rest)

    const account = await db.fundedAccountType.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(account)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update account type' }, { status: 400 })
  }
}

// DELETE /api/funded-accounts?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.fundedAccountType.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete account type' }, { status: 500 })
  }
}