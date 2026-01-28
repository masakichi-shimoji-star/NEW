import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const qualifications = await prisma.qualification.findMany({
      where: { userId: session.user.id },
      orderBy: { acquiredDate: 'desc' },
    })

    return NextResponse.json(qualifications)
  } catch (error) {
    console.error('Get qualifications error:', error)
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
    const { name, acquiredDate } = body

    const qualification = await prisma.qualification.create({
      data: {
        userId: session.user.id,
        name,
        acquiredDate: new Date(acquiredDate),
      },
    })

    return NextResponse.json(qualification)
  } catch (error) {
    console.error('Create qualification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
