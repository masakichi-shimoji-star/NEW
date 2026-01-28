import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    // Check if already submitted and cannot edit
    if (reviewer.evaluation && !reviewer.evaluation.isDraft && !reviewer.evaluation.canEdit) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
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
    } = body

    // Validate required fields
    if (!factBased || !confidentialityConsidered || !noDefamation) {
      return NextResponse.json({ error: '最終チェック項目をすべて確認してください' }, { status: 400 })
    }

    // Update reviewer profile and status
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
          status: 'COMPLETED',
        },
      })
    } else {
      await prisma.reviewer.update({
        where: { id: reviewer.id },
        data: { status: 'COMPLETED' },
      })
    }

    // Calculate edit deadline (7 days from now)
    const editDeadline = new Date()
    editDeadline.setDate(editDeadline.getDate() + 7)

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
        isDraft: false,
        submittedAt: new Date(),
        canEdit: true,
        editDeadline,
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
        isDraft: false,
        submittedAt: new Date(),
        canEdit: true,
        editDeadline,
      },
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Submit evaluation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
