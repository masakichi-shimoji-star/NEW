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
    const { status } = body

    // Verify ownership
    const existing = await prisma.reviewer.findFirst({
      where: { id: params.id, candidateId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const reviewer = await prisma.reviewer.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Update reviewer status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
