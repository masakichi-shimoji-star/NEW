import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewers = await prisma.reviewer.findMany({
      where: { candidateId: session.user.id },
      include: { evaluation: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviewers)
  } catch (error) {
    console.error('Get reviewers error:', error)
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
      name,
      email,
      company,
      department,
      position,
      relationship,
      workPeriodStart,
      workPeriodEnd,
      isCurrentlyWorking,
      memo,
    } = body

    const reviewer = await prisma.reviewer.create({
      data: {
        candidateId: session.user.id,
        name,
        email,
        company,
        department,
        position,
        relationship,
        workPeriodStart: new Date(workPeriodStart),
        workPeriodEnd: workPeriodEnd ? new Date(workPeriodEnd) : null,
        isCurrentlyWorking: isCurrentlyWorking || false,
        memo,
        token: generateToken(32),
      },
    })

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Create reviewer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
