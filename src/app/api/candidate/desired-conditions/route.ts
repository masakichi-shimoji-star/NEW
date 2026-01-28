import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const desiredCondition = await prisma.desiredCondition.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(desiredCondition)
  } catch (error) {
    console.error('Get desired conditions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { desiredJobType, desiredLocation, desiredSalary, availableDate } = body

    const desiredCondition = await prisma.desiredCondition.upsert({
      where: { userId: session.user.id },
      update: {
        desiredJobType,
        desiredLocation,
        desiredSalary,
        availableDate,
      },
      create: {
        userId: session.user.id,
        desiredJobType,
        desiredLocation,
        desiredSalary,
        availableDate,
      },
    })

    return NextResponse.json(desiredCondition)
  } catch (error) {
    console.error('Update desired conditions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
