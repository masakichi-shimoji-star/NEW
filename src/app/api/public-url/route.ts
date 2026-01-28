import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const publicUrl = await prisma.publicUrl.findFirst({
      where: { candidateId: session.user.id },
    })

    return NextResponse.json(publicUrl)
  } catch (error) {
    console.error('Get public URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already exists
    const existing = await prisma.publicUrl.findFirst({
      where: { candidateId: session.user.id },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const publicUrl = await prisma.publicUrl.create({
      data: {
        candidateId: session.user.id,
        token: generateToken(32),
        isActive: true,
      },
    })

    return NextResponse.json(publicUrl)
  } catch (error) {
    console.error('Create public URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
