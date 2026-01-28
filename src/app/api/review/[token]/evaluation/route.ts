import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const reviewer = await prisma.reviewer.findUnique({
      where: { token: params.token },
      include: { evaluation: true },
    })

    if (!reviewer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(reviewer.evaluation)
  } catch (error) {
    console.error('Get evaluation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const reviewer = await prisma.reviewer.findUnique({
      where: { token: params.token },
    })

    if (!reviewer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      profile,
      overallScore,
      recommendationScore,
      wouldWorkAgain,
      wouldWorkAgainReason,
      numericalEvaluations,
      episode1,
      episode2,
      episode3,
      strengthTop,
      strengthEvidence,
      riskTop,
      riskConditions,
      riskSigns,
      riskMitigation,
      suitableEnvironment,
      managementTips,
      overallPersonality,
      factBased,
      confidentialityConsidered,
      noDefamation,
      isDraft,
    } = body

    // Update reviewer profile if provided
    if (profile) {
      await prisma.reviewer.update({
        where: { id: reviewer.id },
        data: {
          name: profile.name,
          email: profile.email,
          company: profile.company,
          department: profile.department,
          position: profile.position,
          relationship: profile.relationship,
          workPeriodStart: profile.workPeriodStart ? new Date(profile.workPeriodStart) : undefined,
          workPeriodEnd: profile.workPeriodEnd ? new Date(profile.workPeriodEnd) : null,
          isCurrentlyWorking: profile.isCurrentlyWorking,
          status: 'IN_PROGRESS',
        },
      })
    }

    // Upsert evaluation
    const evaluation = await prisma.evaluation.upsert({
      where: { reviewerId: reviewer.id },
      update: {
        overallScore,
        recommendationScore,
        wouldWorkAgain,
        wouldWorkAgainReason,
        numericalEvaluations,
        episode1,
        episode2,
        episode3,
        strengthTop,
        strengthEvidence,
        riskTop,
        riskConditions,
        riskSigns,
        riskMitigation,
        suitableEnvironment,
        managementTips,
        overallPersonality,
        factBased,
        confidentialityConsidered,
        noDefamation,
        isDraft: isDraft ?? true,
      },
      create: {
        reviewerId: reviewer.id,
        overallScore,
        recommendationScore,
        wouldWorkAgain,
        wouldWorkAgainReason,
        numericalEvaluations,
        episode1,
        episode2,
        episode3,
        strengthTop,
        strengthEvidence,
        riskTop,
        riskConditions,
        riskSigns,
        riskMitigation,
        suitableEnvironment,
        managementTips,
        overallPersonality,
        factBased,
        confidentialityConsidered,
        noDefamation,
        isDraft: isDraft ?? true,
      },
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Update evaluation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
