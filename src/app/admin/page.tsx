import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Star, Link as LinkIcon, FileText } from 'lucide-react'

export default async function AdminDashboardPage() {
  const [candidatesCount, evaluationsCount, publicUrlsCount, reviewersCount] = await Promise.all([
    prisma.user.count({ where: { role: 'CANDIDATE' } }),
    prisma.evaluation.count({ where: { isDraft: false } }),
    prisma.publicUrl.count({ where: { isActive: true } }),
    prisma.reviewer.count(),
  ])

  const recentCandidates = await prisma.user.findMany({
    where: { role: 'CANDIDATE' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      onboardingCompleted: true,
    },
  })

  const recentEvaluations = await prisma.evaluation.findMany({
    where: { isDraft: false },
    orderBy: { submittedAt: 'desc' },
    take: 5,
    include: {
      reviewer: {
        include: {
          candidate: {
            select: { name: true },
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">管理ダッシュボード</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">候補者数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">評価数</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">評価者数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公開URL数</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicUrlsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近の登録候補者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(candidate.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近の評価</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{evaluation.reviewer.candidate.name}さんへの評価</p>
                    <p className="text-sm text-muted-foreground">
                      評価者: {evaluation.reviewer.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{evaluation.overallScore}/100</p>
                    <p className="text-sm text-muted-foreground">
                      {evaluation.submittedAt ? new Date(evaluation.submittedAt).toLocaleDateString('ja-JP') : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
