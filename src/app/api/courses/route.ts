import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { CourseSchema } from '@/lib/schemas'

// GET /api/courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const where: any = { deletedAt: null }
    if (active === 'true') where.isActive = true
    if (active === 'false') where.isActive = false

    const courses = await db.course.findMany({
      where,
      include: {
        _count: { select: { enrollments: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

// POST /api/courses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CourseSchema.parse(body)

    const course = await db.course.create({
      data: validated,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create course' }, { status: 400 })
  }
}

// PUT /api/courses
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    const validated = CourseSchema.partial().parse(rest)

    const course = await db.course.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(course)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update course' }, { status: 400 })
  }
}

// DELETE /api/courses?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.course.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}