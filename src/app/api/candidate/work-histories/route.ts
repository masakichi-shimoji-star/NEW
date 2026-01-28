import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workHistories = await prisma.workHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(workHistories)
  } catch (error) {
    console.error('Get work histories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const workHistory = await prisma.workHistory.create({
      data: {
        userId: session.user.id,
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
    console.error('Create work history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
