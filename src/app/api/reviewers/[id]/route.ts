import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewer = await prisma.reviewer.findFirst({
      where: { id: params.id, candidateId: session.user.id },
      include: { evaluation: true },
    })

    if (!reviewer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Get reviewer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Verify ownership
    const existing = await prisma.reviewer.findFirst({
      where: { id: params.id, candidateId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const reviewer = await prisma.reviewer.update({
      where: { id: params.id },
      data: {
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
      },
    })

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Update reviewer error:', error)
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
    const existing = await prisma.reviewer.findFirst({
      where: { id: params.id, candidateId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.reviewer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reviewer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
