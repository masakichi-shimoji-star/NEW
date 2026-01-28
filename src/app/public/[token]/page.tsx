import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Star, CheckCircle, XCircle, Building, Calendar } from 'lucide-react'
import { getSchoolTypeLabel, getRelationshipLabel, formatYearMonth, formatDate } from '@/lib/utils'

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

export default async function PublicPage({
  params,
}: {
  params: { token: string }
}) {
  const publicUrl = await prisma.publicUrl.findUnique({
    where: { token: params.token },
    include: {
      candidate: {
        include: {
          educations: { orderBy: { enrollmentDate: 'desc' } },
          workHistories: { orderBy: { startDate: 'desc' } },
          qualifications: { orderBy: { acquiredDate: 'desc' } },
          skills: { orderBy: { level: 'desc' } },
          desiredCondition: true,
          reviewers: {
            where: { status: 'COMPLETED' },
            include: {
              evaluation: {
                where: { isDraft: false, isExcluded: false },
              },
            },
          },
        },
      },
    },
  })

  if (!publicUrl || !publicUrl.isActive) {
    notFound()
  }

  const candidate = publicUrl.candidate
  const evaluations = candidate.reviewers
    .filter(r => r.evaluation)
    .map(r => ({ reviewer: r, evaluation: r.evaluation! }))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={candidate.photo || undefined} />
                <AvatarFallback className="text-4xl">{candidate.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-1">{candidate.name}</h1>
                {candidate.nameKana && (
                  <p className="text-muted-foreground mb-4">{candidate.nameKana}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">メール: </span>
                    {candidate.email}
                  </div>
                  {candidate.phone && (
                    <div>
                      <span className="text-muted-foreground">電話: </span>
                      {candidate.phone}
                    </div>
                  )}
                  {candidate.address && (
                    <div>
                      <span className="text-muted-foreground">居住地: </span>
                      {candidate.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {evaluations.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">平均総合評価</p>
                <p className="text-4xl font-bold">
                  {Math.round(evaluations.reduce((sum, e) => sum + (e.evaluation.overallScore || 0), 0) / evaluations.length)}
                </p>
                <p className="text-sm text-muted-foreground">/100</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">平均推薦度</p>
                <p className="text-4xl font-bold">
                  {(evaluations.reduce((sum, e) => sum + (e.evaluation.recommendationScore || 0), 0) / evaluations.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">/10</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">評価者数</p>
                <p className="text-4xl font-bold">{evaluations.length}</p>
                <p className="text-sm text-muted-foreground">件</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resume */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>履歴書</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Education */}
            {candidate.educations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">学歴</h3>
                <div className="space-y-3">
                  {candidate.educations.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{edu.schoolName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getSchoolTypeLabel(edu.schoolType)}
                            {edu.faculty && ` / ${edu.faculty}`}
                            {edu.department && ` ${edu.department}`}
                          </p>
                          {edu.major && (
                            <p className="text-sm text-muted-foreground">専攻: {edu.major}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatYearMonth(edu.enrollmentDate)} - {edu.isEnrolled ? '在学中' : edu.graduationDate ? formatYearMonth(edu.graduationDate) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Work History */}
            {candidate.workHistories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">職歴</h3>
                <div className="space-y-4">
                  {candidate.workHistories.map((work) => (
                    <div key={work.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{work.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {work.department && `${work.department} / `}
                            {work.position || ''}
                            {work.employmentType && ` (${work.employmentType})`}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatYearMonth(work.startDate)} - {work.isCurrentJob ? '現在' : work.endDate ? formatYearMonth(work.endDate) : ''}
                        </p>
                      </div>
                      {work.responsibilities && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">担当業務</p>
                          <p className="text-sm whitespace-pre-wrap">{work.responsibilities}</p>
                        </div>
                      )}
                      {work.achievements && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">実績・成果</p>
                          <p className="text-sm whitespace-pre-wrap">{work.achievements}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {candidate.skills.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">スキル</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name} (Lv.{skill.level})
                        {skill.yearsOfExperience && ` ${skill.yearsOfExperience}年`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {candidate.qualifications.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">資格</h3>
                  <div className="space-y-1">
                    {candidate.qualifications.map((qual) => (
                      <div key={qual.id} className="flex justify-between text-sm">
                        <span>{qual.name}</span>
                        <span className="text-muted-foreground">{formatYearMonth(qual.acquiredDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {candidate.selfPr && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">自己PR</h3>
                  <p className="whitespace-pre-wrap">{candidate.selfPr}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Evaluations */}
        {evaluations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>評価一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {evaluations.map(({ reviewer, evaluation }, index) => {
                  const numerical = evaluation.numericalEvaluations
                    ? JSON.parse(evaluation.numericalEvaluations)
                    : null
                  const episode1 = evaluation.episode1 ? JSON.parse(evaluation.episode1) : null
                  const episode2 = evaluation.episode2 ? JSON.parse(evaluation.episode2) : null
                  const episode3 = evaluation.episode3 ? JSON.parse(evaluation.episode3) : null

                  return (
                    <AccordionItem key={reviewer.id} value={reviewer.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <p className="font-medium">{reviewer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {reviewer.company}
                                {reviewer.department && ` / ${reviewer.department}`}
                                {reviewer.position && ` / ${reviewer.position}`}
                              </p>
                            </div>
                            <Badge variant="outline">{getRelationshipLabel(reviewer.relationship)}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{evaluation.overallScore}/100</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-6 pt-4">
                        {/* Reviewer Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">関係性</p>
                            <p>{getRelationshipLabel(reviewer.relationship)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">共同期間</p>
                            <p>
                              {formatYearMonth(reviewer.workPeriodStart)} - {reviewer.isCurrentlyWorking ? '現在' : reviewer.workPeriodEnd ? formatYearMonth(reviewer.workPeriodEnd) : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">提出日</p>
                            <p>{evaluation.submittedAt ? formatDate(evaluation.submittedAt) : '-'}</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Overall Conclusion */}
                        <div>
                          <h4 className="font-semibold mb-4">総合結論</h4>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">総合評価</p>
                              <p className="text-3xl font-bold">{evaluation.overallScore}/100</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">推薦度</p>
                              <p className="text-3xl font-bold">{evaluation.recommendationScore}/10</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">再び働きたい</p>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                {evaluation.wouldWorkAgain ? (
                                  <>
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <span className="font-bold">Yes</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-6 w-6 text-red-500" />
                                    <span className="font-bold">No</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {evaluation.wouldWorkAgainReason && (
                            <div>
                              <p className="text-sm text-muted-foreground">理由</p>
                              <p className="whitespace-pre-wrap">{evaluation.wouldWorkAgainReason}</p>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Numerical Evaluations */}
                        {numerical && (
                          <div>
                            <h4 className="font-semibold mb-4">数値評価</h4>
                            <div className="space-y-2">
                              {Object.entries(numericalLabels).map(([key, label]) => {
                                const score = numerical[key]
                                return (
                                  <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm">{label}</span>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-4 w-4 ${
                                            star <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Episodes */}
                        {[episode1, episode2, episode3].map((episode, idx) => (
                          episode && (
                            <div key={idx}>
                              <h4 className="font-semibold mb-2">エピソード {idx + 1}: {episode.title}</h4>
                              <div className="space-y-2 text-sm">
                                {episode.background && (
                                  <div>
                                    <p className="text-muted-foreground">目的・背景</p>
                                    <p className="whitespace-pre-wrap">{episode.background}</p>
                                  </div>
                                )}
                                {episode.role && (
                                  <div>
                                    <p className="text-muted-foreground">役割</p>
                                    <p className="whitespace-pre-wrap">{episode.role}</p>
                                  </div>
                                )}
                                {episode.actions && (
                                  <div>
                                    <p className="text-muted-foreground">行動</p>
                                    <p className="whitespace-pre-wrap">{episode.actions}</p>
                                  </div>
                                )}
                                {episode.results && (
                                  <div>
                                    <p className="text-muted-foreground">成果</p>
                                    <p className="whitespace-pre-wrap">{episode.results}</p>
                                  </div>
                                )}
                              </div>
                              <Separator className="mt-4" />
                            </div>
                          )
                        ))}

                        {/* Cross-sectional */}
                        <div>
                          <h4 className="font-semibold mb-4">横断評価</h4>
                          <div className="space-y-4">
                            {evaluation.strengthTop && (
                              <div>
                                <p className="text-sm text-muted-foreground">強み</p>
                                <p className="whitespace-pre-wrap">{evaluation.strengthTop}</p>
                              </div>
                            )}
                            {evaluation.riskTop && (
                              <div>
                                <p className="text-sm text-muted-foreground">リスク</p>
                                <p className="whitespace-pre-wrap">{evaluation.riskTop}</p>
                              </div>
                            )}
                            {evaluation.suitableEnvironment && (
                              <div>
                                <p className="text-sm text-muted-foreground">向いている環境</p>
                                <p className="whitespace-pre-wrap">{evaluation.suitableEnvironment}</p>
                              </div>
                            )}
                            {evaluation.managementTips && (
                              <div>
                                <p className="text-sm text-muted-foreground">マネジメントのコツ</p>
                                <p className="whitespace-pre-wrap">{evaluation.managementTips}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {evaluation.overallPersonality && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-2">総合人物像</h4>
                              <p className="whitespace-pre-wrap">{evaluation.overallPersonality}</p>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Badge variant={evaluation.factBased ? 'default' : 'outline'}>
                            {evaluation.factBased && <CheckCircle className="mr-1 h-3 w-3" />}
                            事実ベース
                          </Badge>
                          <Badge variant={evaluation.confidentialityConsidered ? 'default' : 'outline'}>
                            {evaluation.confidentialityConsidered && <CheckCircle className="mr-1 h-3 w-3" />}
                            守秘義務配慮
                          </Badge>
                          <Badge variant={evaluation.noDefamation ? 'default' : 'outline'}>
                            {evaluation.noDefamation && <CheckCircle className="mr-1 h-3 w-3" />}
                            誹謗中傷なし
                          </Badge>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by WorkView</p>
        </div>
      </div>
    </div>
  )
}
