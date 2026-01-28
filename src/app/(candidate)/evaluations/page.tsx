import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Star, Building } from 'lucide-react'
import { getRelationshipLabel, formatYearMonth, formatDate } from '@/lib/utils'

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams: { relationship?: string; q?: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const where: any = {
    candidateId: session.user.id,
    status: 'COMPLETED',
    evaluation: { isNot: null },
  }

  if (searchParams.relationship) {
    where.relationship = searchParams.relationship
  }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { company: { contains: searchParams.q } },
    ]
  }

  const reviewers = await prisma.reviewer.findMany({
    where,
    include: {
      evaluation: true,
    },
    orderBy: { evaluation: { submittedAt: 'desc' } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">評価一覧</h1>
        <p className="text-muted-foreground">受け取った評価の閲覧（閲覧専用）</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <form className="flex gap-4 flex-1">
          <Input
            name="q"
            placeholder="評価者名や会社名で検索"
            defaultValue={searchParams.q}
            className="max-w-xs"
          />
          <Select name="relationship" defaultValue={searchParams.relationship || ''}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="関係性" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべて</SelectItem>
              <SelectItem value="SUPERVISOR">上司</SelectItem>
              <SelectItem value="COLLEAGUE">同僚</SelectItem>
              <SelectItem value="SUBORDINATE">部下</SelectItem>
              <SelectItem value="CLIENT">取引先</SelectItem>
              <SelectItem value="OTHER">その他</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="secondary">検索</Button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        {reviewers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">評価がまだありません</h3>
              <p className="text-muted-foreground">
                評価者が回答を完了すると、ここに表示されます
              </p>
            </CardContent>
          </Card>
        ) : (
          reviewers.map((reviewer) => (
            reviewer.evaluation && (
              <Link key={reviewer.id} href={`/evaluations/${reviewer.evaluation.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{reviewer.name}</h3>
                          <Badge variant="outline">{getRelationshipLabel(reviewer.relationship)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {reviewer.company}
                            {reviewer.department && ` / ${reviewer.department}`}
                          </span>
                          {reviewer.position && <span>{reviewer.position}</span>}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="mr-4">
                            共同期間: {formatYearMonth(reviewer.workPeriodStart)} - {reviewer.isCurrentlyWorking ? '現在' : reviewer.workPeriodEnd ? formatYearMonth(reviewer.workPeriodEnd) : ''}
                          </span>
                          <span>提出日: {reviewer.evaluation.submittedAt ? formatDate(reviewer.evaluation.submittedAt) : '-'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <p className="text-sm text-muted-foreground">総合評価</p>
                          <p className="text-3xl font-bold">{reviewer.evaluation.overallScore}/100</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">推薦度</p>
                          <p className="text-xl font-semibold">{reviewer.evaluation.recommendationScore}/10</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          ))
        )}
      </div>
    </div>
  )
}
