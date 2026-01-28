import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, Mail, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { getRelationshipLabel, getReviewerStatusLabel, getReviewerStatusColor, formatYearMonth } from '@/lib/utils'

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: { status?: string; relationship?: string; q?: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const where: any = { candidateId: session.user.id }

  if (searchParams.status) {
    where.status = searchParams.status
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
    include: { evaluation: true },
    orderBy: { updatedAt: 'desc' },
  })

  const stats = {
    total: reviewers.length,
    notSent: reviewers.filter(r => r.status === 'NOT_SENT').length,
    sent: reviewers.filter(r => r.status === 'SENT').length,
    inProgress: reviewers.filter(r => r.status === 'IN_PROGRESS').length,
    completed: reviewers.filter(r => r.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">依頼一覧</h1>
        <p className="text-muted-foreground">評価依頼の進捗管理</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">合計</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.notSent}</p>
            <p className="text-sm text-muted-foreground">未送信</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.sent}</p>
            <p className="text-sm text-muted-foreground">送信済</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">回答中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">回答済</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <form className="flex gap-4 flex-1">
          <Input
            name="q"
            placeholder="名前や会社名で検索"
            defaultValue={searchParams.q}
            className="max-w-xs"
          />
          <Select name="status" defaultValue={searchParams.status || ''}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべて</SelectItem>
              <SelectItem value="NOT_SENT">未送信</SelectItem>
              <SelectItem value="SENT">送信済</SelectItem>
              <SelectItem value="IN_PROGRESS">回答中</SelectItem>
              <SelectItem value="COMPLETED">回答済</SelectItem>
            </SelectContent>
          </Select>
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
              <p className="text-muted-foreground">該当する依頼がありません</p>
            </CardContent>
          </Card>
        ) : (
          reviewers.map((reviewer) => (
            <Link key={reviewer.id} href={`/reviewers/${reviewer.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{reviewer.name}</h3>
                        <Badge className={getReviewerStatusColor(reviewer.status)}>
                          {getReviewerStatusLabel(reviewer.status)}
                        </Badge>
                        <Badge variant="outline">{getRelationshipLabel(reviewer.relationship)}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {reviewer.company}
                          {reviewer.department && ` / ${reviewer.department}`}
                        </span>
                        {reviewer.position && (
                          <span>{reviewer.position}</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        共同期間: {formatYearMonth(reviewer.workPeriodStart)} - {reviewer.isCurrentlyWorking ? '現在' : reviewer.workPeriodEnd ? formatYearMonth(reviewer.workPeriodEnd) : ''}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>最終更新</p>
                      <p>{new Date(reviewer.updatedAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
