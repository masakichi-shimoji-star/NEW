import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const educations = await prisma.education.findMany({
      where: { userId: session.user.id },
      orderBy: { enrollmentDate: 'desc' },
    })

    return NextResponse.json(educations)
  } catch (error) {
    console.error('Get educations error:', error)
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
    const { schoolType, schoolName, faculty, department, enrollmentDate, graduationDate, isEnrolled, major } = body

    const education = await prisma.education.create({
      data: {
        userId: session.user.id,
        schoolType,
        schoolName,
        faculty,
        department,
        enrollmentDate: new Date(enrollmentDate),
        graduationDate: graduationDate ? new Date(graduationDate) : null,
        isEnrolled: isEnrolled || false,
        major,
      },
    })

    return NextResponse.json(education)
  } catch (error) {
    console.error('Create education error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
