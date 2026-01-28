import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function AdminLogsPage() {
  // Get recent reviewer creations as "request created" logs
  const recentReviewers = await prisma.reviewer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      candidate: {
        select: { name: true },
      },
    },
  })

  // Get recent evaluations as "evaluation submitted" logs
  const recentEvaluations = await prisma.evaluation.findMany({
    where: { isDraft: false },
    orderBy: { submittedAt: 'desc' },
    take: 50,
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

  // Get recent public URL changes
  const recentPublicUrls = await prisma.publicUrl.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      candidate: {
        select: { name: true },
      },
    },
  })

  // Combine and sort all logs
  const logs = [
    ...recentReviewers.map((r) => ({
      type: 'reviewer_created',
      date: r.createdAt,
      description: `${r.candidate.name}さんが評価者「${r.name}」を登録`,
      details: `会社: ${r.company}, トークン: ${r.token.slice(0, 8)}...`,
    })),
    ...recentEvaluations.map((e) => ({
      type: 'evaluation_submitted',
      date: e.submittedAt || e.createdAt,
      description: `${e.reviewer.name}が${e.reviewer.candidate.name}さんを評価`,
      details: `総合評価: ${e.overallScore}/100`,
    })),
    ...recentPublicUrls.map((p) => ({
      type: 'public_url_updated',
      date: p.updatedAt,
      description: `${p.candidate.name}さんの公開URL ${p.isActive ? '有効化' : '無効化'}`,
      details: `トークン: ${p.token.slice(0, 8)}...`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 100)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reviewer_created':
        return '評価者登録'
      case 'evaluation_submitted':
        return '評価送信'
      case 'public_url_updated':
        return '公開URL更新'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reviewer_created':
        return 'bg-blue-100 text-blue-800'
      case 'evaluation_submitted':
        return 'bg-green-100 text-green-800'
      case 'public_url_updated':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">監査ログ</h1>

      <Card>
        <CardHeader>
          <CardTitle>アクティビティ履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                  {getTypeLabel(log.type)}
                </div>
                <div className="flex-1">
                  <p>{log.description}</p>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(log.date)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
