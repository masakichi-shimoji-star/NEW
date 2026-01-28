import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skills = await prisma.skill.findMany({
      where: { userId: session.user.id },
      orderBy: { level: 'desc' },
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error('Get skills error:', error)
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
    const { name, level, yearsOfExperience } = body

    const skill = await prisma.skill.create({
      data: {
        userId: session.user.id,
        name,
        level: level || 3,
        yearsOfExperience,
      },
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Create skill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
