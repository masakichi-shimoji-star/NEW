import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react'
import { getRelationshipLabel, formatYearMonth, formatDate } from '@/lib/utils'

const numericalLabels: Record<string, string> = {
  expertise: '専門知識・スキル',
  problemSolving: '問題解決能力',
  communication: 'コミュニケーション能力',
  teamwork: 'チームワーク・協調性',
  leadership: 'リーダーシップ',
  initiative: '主体性・積極性',
  responsibility: '責任感',
  timeManagement: '時間管理・締切遵守',
  creativity: '創造性・革新性',
  stressResistance: 'ストレス耐性',
}

export default async function EvaluationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const evaluation = await prisma.evaluation.findUnique({
    where: { id: params.id },
    include: {
      reviewer: {
        include: {
          candidate: true,
        },
      },
    },
  })

  if (!evaluation) notFound()

  // Verify that the evaluation belongs to the current user
  if (evaluation.reviewer.candidateId !== session.user.id) {
    redirect('/evaluations')
  }

  const reviewer = evaluation.reviewer
  const numericalEvaluations = evaluation.numericalEvaluations
    ? JSON.parse(evaluation.numericalEvaluations)
    : null
  const episode1 = evaluation.episode1 ? JSON.parse(evaluation.episode1) : null
  const episode2 = evaluation.episode2 ? JSON.parse(evaluation.episode2) : null
  const episode3 = evaluation.episode3 ? JSON.parse(evaluation.episode3) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/evaluations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">評価詳細</h1>
          <p className="text-muted-foreground">
            {reviewer.name}さんからの評価（閲覧専用）
          </p>
        </div>
      </div>

      {/* Reviewer Info */}
      <Card>
        <CardHeader>
          <CardTitle>評価者プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">氏名</p>
              <p className="font-medium">{reviewer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">会社</p>
              <p className="font-medium">{reviewer.company}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">部署</p>
              <p className="font-medium">{reviewer.department || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">役職</p>
              <p className="font-medium">{reviewer.position || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">関係性</p>
              <p className="font-medium">{getRelationshipLabel(reviewer.relationship)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">共同期間</p>
              <p className="font-medium">
                {formatYearMonth(reviewer.workPeriodStart)} - {reviewer.isCurrentlyWorking ? '現在' : reviewer.workPeriodEnd ? formatYearMonth(reviewer.workPeriodEnd) : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">提出日</p>
              <p className="font-medium">{evaluation.submittedAt ? formatDate(evaluation.submittedAt) : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle>総合結論</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">総合評価</p>
              <p className="text-5xl font-bold">{evaluation.overallScore}</p>
              <p className="text-muted-foreground">/100</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">推薦度</p>
              <p className="text-5xl font-bold">{evaluation.recommendationScore}</p>
              <p className="text-muted-foreground">/10</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">再び働きたい</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {evaluation.wouldWorkAgain ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <span className="text-2xl font-bold">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <span className="text-2xl font-bold">No</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {evaluation.wouldWorkAgainReason && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">理由</p>
              <p className="whitespace-pre-wrap">{evaluation.wouldWorkAgainReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Numerical Evaluations */}
      {numericalEvaluations && (
        <Card>
          <CardHeader>
            <CardTitle>数値評価</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(numericalLabels).map(([key, label]) => {
                const score = numericalEvaluations[key]
                const comment = numericalEvaluations[`${key}Comment`]
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-semibold">{score}/5</span>
                      </div>
                    </div>
                    {comment && (
                      <p className="text-sm text-muted-foreground ml-4">{comment}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Episodes */}
      {[episode1, episode2, episode3].map((episode, index) => (
        episode && (
          <Card key={index}>
            <CardHeader>
              <CardTitle>エピソード {index + 1}: {episode.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">期間</p>
                <p>{episode.period}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">目的・背景</p>
                <p className="whitespace-pre-wrap">{episode.background}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">候補者の役割</p>
                <p className="whitespace-pre-wrap">{episode.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">具体的な行動</p>
                <p className="whitespace-pre-wrap">{episode.actions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">成果・結果</p>
                <p className="whitespace-pre-wrap">{episode.results}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">発揮された能力・特性</p>
                <p className="whitespace-pre-wrap">{episode.abilities}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">課題や困難への対応</p>
                <p className="whitespace-pre-wrap">{episode.challenges}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">学びや成長</p>
                <p className="whitespace-pre-wrap">{episode.learnings}</p>
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {/* Cross-sectional Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>横断評価</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">強みTop</p>
            <p className="whitespace-pre-wrap">{evaluation.strengthTop}</p>
            {evaluation.strengthEvidence && (
              <div className="mt-2 pl-4 border-l-2">
                <p className="text-sm text-muted-foreground">根拠</p>
                <p className="whitespace-pre-wrap">{evaluation.strengthEvidence}</p>
              </div>
            )}
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">リスクTop</p>
            <p className="whitespace-pre-wrap">{evaluation.riskTop}</p>
            {(evaluation.riskConditions || evaluation.riskSigns || evaluation.riskMitigation) && (
              <div className="mt-2 pl-4 border-l-2 space-y-2">
                {evaluation.riskConditions && (
                  <div>
                    <p className="text-sm text-muted-foreground">発生条件</p>
                    <p className="whitespace-pre-wrap">{evaluation.riskConditions}</p>
                  </div>
                )}
                {evaluation.riskSigns && (
                  <div>
                    <p className="text-sm text-muted-foreground">兆候</p>
                    <p className="whitespace-pre-wrap">{evaluation.riskSigns}</p>
                  </div>
                )}
                {evaluation.riskMitigation && (
                  <div>
                    <p className="text-sm text-muted-foreground">対処法</p>
                    <p className="whitespace-pre-wrap">{evaluation.riskMitigation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">向いている環境・役割</p>
            <p className="whitespace-pre-wrap">{evaluation.suitableEnvironment}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">マネジメント/育成のコツ</p>
            <p className="whitespace-pre-wrap">{evaluation.managementTips}</p>
          </div>
        </CardContent>
      </Card>

      {/* Overall Personality */}
      {evaluation.overallPersonality && (
        <Card>
          <CardHeader>
            <CardTitle>総合人物像</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{evaluation.overallPersonality}</p>
          </CardContent>
        </Card>
      )}

      {/* Final Checks */}
      <Card>
        <CardHeader>
          <CardTitle>最終チェック</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge variant={evaluation.factBased ? 'default' : 'outline'}>
              {evaluation.factBased ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              事実ベース
            </Badge>
            <Badge variant={evaluation.confidentialityConsidered ? 'default' : 'outline'}>
              {evaluation.confidentialityConsidered ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              守秘義務配慮
            </Badge>
            <Badge variant={evaluation.noDefamation ? 'default' : 'outline'}>
              {evaluation.noDefamation ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              誹謗中傷なし
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
