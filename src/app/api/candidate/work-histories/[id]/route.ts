import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      department,
      employmentType,
      startDate,
      endDate,
      isCurrentJob,
      position,
      jobCategory,
      responsibilities,
      achievements,
      skills,
    } = body

    // Verify ownership
    const existing = await prisma.workHistory.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const workHistory = await prisma.workHistory.update({
      where: { id: params.id },
      data: {
        companyName,
        department,
        employmentType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrentJob: isCurrentJob || false,
        position,
        jobCategory,
        responsibilities,
        achievements,
        skills,
      },
    })

    return NextResponse.json(workHistory)
  } catch (error) {
    console.error('Update work history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.workHistory.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.workHistory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete work history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
