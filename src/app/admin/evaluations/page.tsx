import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, Ban, CheckCircle } from 'lucide-react'
import { getRelationshipLabel, formatDate } from '@/lib/utils'

export default async function AdminEvaluationsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const where: any = { isDraft: false }
  if (searchParams.q) {
    where.OR = [
      { reviewer: { name: { contains: searchParams.q } } },
      { reviewer: { company: { contains: searchParams.q } } },
      { reviewer: { candidate: { name: { contains: searchParams.q } } } },
    ]
  }

  const evaluations = await prisma.evaluation.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    include: {
      reviewer: {
        include: {
          candidate: {
            select: { name: true, email: true },
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">評価管理</h1>

      <form className="flex gap-4">
        <Input
          name="q"
          placeholder="評価者名、会社名、候補者名で検索"
          defaultValue={searchParams.q}
          className="max-w-sm"
        />
        <Button type="submit">検索</Button>
      </form>

      <div className="space-y-4">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{evaluation.reviewer.candidate.name}さんへの評価</h3>
                    {evaluation.isExcluded ? (
                      <Badge variant="destructive">
                        <Ban className="mr-1 h-3 w-3" />
                        除外
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        公開中
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    評価者: {evaluation.reviewer.name} ({evaluation.reviewer.company})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    関係性: {getRelationshipLabel(evaluation.reviewer.relationship)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{evaluation.overallScore}/100</p>
                    <p className="text-sm text-muted-foreground">
                      提出日: {evaluation.submittedAt ? formatDate(evaluation.submittedAt) : '-'}
                    </p>
                  </div>
                  <Link href={`/admin/evaluations/${evaluation.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      詳細
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
