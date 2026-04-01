import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { StudentSchema } from '@/lib/schemas'

// GET /api/students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = { deletedAt: null }
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { id: search },
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const students = await db.student.findMany({
      where,
      include: {
        courseEnrollments: { where: { deletedAt: null }, include: { course: true } },
        fundedAccountSales: { where: { deletedAt: null }, include: { accountType: true } },
        payments: { where: { deletedAt: null }, select: { amount: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const computedStudents = students.map(student => {
      const enrollmentPaid = student.courseEnrollments.reduce((sum, e) => sum + e.amountPaid, 0)
      const fundedPaid = student.fundedAccountSales.reduce((sum, s) => sum + s.amountPaid, 0)
      const manualPaid = student.payments.reduce((sum, p) => sum + p.amount, 0)
      
      return {
        ...student,
        totalPaid: enrollmentPaid + fundedPaid + manualPaid,
        payments: undefined
      }
    })

    return NextResponse.json(computedStudents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// POST /api/students
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.permissions?.canManageStudents) {
    return NextResponse.json({ error: 'غير مصرح لك بإضافة طلاب' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = StudentSchema.parse(body)

    const student = await db.student.create({
      data: validated,
    })

    return NextResponse.json({ ...student, totalPaid: 0 }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create student' }, { status: 400 })
  }
}

// PUT /api/students
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.permissions?.canManageStudents) {
    return NextResponse.json({ error: 'غير مصرح لك بتعديل بيانات الطلاب' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    // allow partial updates
    const validated = StudentSchema.partial().parse(rest)

    const student = await db.student.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(student)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update student' }, { status: 400 })
  }
}

// DELETE /api/students?id=xxx
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.permissions?.canManageStudents) {
    return NextResponse.json({ error: 'غير مصرح لك بحذف الطلاب' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.student.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
