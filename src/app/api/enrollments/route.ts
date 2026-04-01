import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// GET /api/enrollments?courseId=xxx&status=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')

    const where: any = { deletedAt: null }
    if (courseId) where.courseId = courseId
    if (studentId) where.studentId = studentId

    const enrollments = await db.courseEnrollment.findMany({
      where,
      include: { student: true, course: true },
      orderBy: { enrolledAt: 'desc' },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}

// POST /api/enrollments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId, paymentStatus, amountPaid, notes } = body

    if (!studentId || !courseId) {
      return NextResponse.json({ error: 'Student ID and Course ID are required' }, { status: 400 })
    }

    const enrollment = await db.courseEnrollment.create({
      data: {
        studentId,
        courseId,
        paymentStatus: paymentStatus || 'pending',
        amountPaid: Number(amountPaid) || 0,
        notes,
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}

// PUT /api/enrollments
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, paymentStatus, amountPaid, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const enrollment = await db.courseEnrollment.update({
      where: { id },
      data: { paymentStatus, amountPaid: Number(amountPaid) || 0, notes },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }
}

// DELETE /api/enrollments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.courseEnrollment.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete enrollment' }, { status: 500 })
  }
}
