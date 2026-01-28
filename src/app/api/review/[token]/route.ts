import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const reviewer = await prisma.reviewer.findUnique({
      where: { token: params.token },
      include: {
        candidate: {
          select: { name: true },
        },
        evaluation: true,
      },
    })

    if (!reviewer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Get review data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
