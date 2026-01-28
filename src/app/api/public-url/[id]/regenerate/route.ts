import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.publicUrl.findFirst({
      where: { id: params.id, candidateId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const publicUrl = await prisma.publicUrl.update({
      where: { id: params.id },
      data: { token: generateToken(32) },
    })

    return NextResponse.json(publicUrl)
  } catch (error) {
    console.error('Regenerate public URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
