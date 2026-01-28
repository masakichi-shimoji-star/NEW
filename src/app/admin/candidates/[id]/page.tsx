import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { getSchoolTypeLabel, getRelationshipLabel, getReviewerStatusLabel, formatYearMonth, formatDate } from '@/lib/utils'

export default async function AdminCandidateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const candidate = await prisma.user.findUnique({
    where: { id: params.id, role: 'CANDIDATE' },
    include: {
      educations: { orderBy: { enrollmentDate: 'desc' } },
      workHistories: { orderBy: { startDate: 'desc' } },
      qualifications: { orderBy: { acquiredDate: 'desc' } },
      skills: { orderBy: { level: 'desc' } },
      desiredCondition: true,
      reviewers: {
        include: {
          evaluation: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      publicUrls: true,
    },
  })

  if (!candidate) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/candidates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <p className="text-muted-foreground">{candidate.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">氏名</p>
                <p>{candidate.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">氏名カナ</p>
                <p>{candidate.nameKana || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">メール</p>
                <p>{candidate.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">電話</p>
                <p>{candidate.phone || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">住所</p>
              <p>{candidate.address || '-'}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">登録日</p>
                <p>{formatDate(candidate.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">オンボーディング</p>
                <Badge variant={candidate.onboardingCompleted ? 'default' : 'secondary'}>
                  {candidate.onboardingCompleted ? '完了' : '未完了'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>公開URL</CardTitle>
          </CardHeader>
          <CardContent>
            {candidate.publicUrls.length === 0 ? (
              <p className="text-muted-foreground">未発行</p>
            ) : (
              <div className="space-y-4">
                {candidate.publicUrls.map((url) => (
                  <div key={url.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm">{url.token.slice(0, 16)}...</p>
                      <p className="text-sm text-muted-foreground">
                        発行日: {formatDate(url.createdAt)}
                      </p>
                    </div>
                    <Badge variant={url.isActive ? 'default' : 'secondary'}>
                      {url.isActive ? (
                        <><CheckCircle className="mr-1 h-3 w-3" /> 有効</>
                      ) : (
                        <><XCircle className="mr-1 h-3 w-3" /> 無効</>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>評価者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {candidate.reviewers.length === 0 ? (
            <p className="text-muted-foreground">評価者が登録されていません</p>
          ) : (
            <div className="space-y-4">
              {candidate.reviewers.map((reviewer) => (
                <div key={reviewer.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{reviewer.name}</p>
                      <Badge variant="outline">{getRelationshipLabel(reviewer.relationship)}</Badge>
                      <Badge className={
                        reviewer.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        reviewer.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        reviewer.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {getReviewerStatusLabel(reviewer.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reviewer.company}
                      {reviewer.department && ` / ${reviewer.department}`}
                      {reviewer.position && ` / ${reviewer.position}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reviewer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    {reviewer.evaluation && !reviewer.evaluation.isDraft ? (
                      <div>
                        <p className="text-2xl font-bold">{reviewer.evaluation.overallScore}/100</p>
                        <p className="text-sm text-muted-foreground">
                          提出日: {reviewer.evaluation.submittedAt ? formatDate(reviewer.evaluation.submittedAt) : '-'}
                        </p>
                      </div>
                    ) : reviewer.evaluation?.isDraft ? (
                      <Badge variant="secondary">下書き</Badge>
                    ) : (
                      <span className="text-muted-foreground">未回答</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {candidate.selfPr && (
        <Card>
          <CardHeader>
            <CardTitle>自己PR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{candidate.selfPr}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
