import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, Building, User } from 'lucide-react'
import { getRelationshipLabel, getReviewerStatusLabel, getReviewerStatusColor, formatYearMonth } from '@/lib/utils'

export default async function ReviewersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const reviewers = await prisma.reviewer.findMany({
    where: { candidateId: session.user.id },
    include: { evaluation: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">評価者管理</h1>
          <p className="text-muted-foreground">評価を依頼する方を登録・管理</p>
        </div>
        <Link href="/reviewers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            評価者を追加
          </Button>
        </Link>
      </div>

      {reviewers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">評価者が登録されていません</h3>
            <p className="text-muted-foreground mb-4">
              過去の上司や同僚を登録して、評価を依頼しましょう
            </p>
            <Link href="/reviewers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                評価者を追加
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviewers.map((reviewer) => (
            <Link key={reviewer.id} href={`/reviewers/${reviewer.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{reviewer.name}</h3>
                        <Badge className={getReviewerStatusColor(reviewer.status)}>
                          {getReviewerStatusLabel(reviewer.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {reviewer.company}
                          {reviewer.department && ` / ${reviewer.department}`}
                        </span>
                        {reviewer.position && (
                          <span>{reviewer.position}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {reviewer.email}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="mr-4">関係性: {getRelationshipLabel(reviewer.relationship)}</span>
                        <span>
                          共同期間: {formatYearMonth(reviewer.workPeriodStart)} - {reviewer.isCurrentlyWorking ? '現在' : reviewer.workPeriodEnd ? formatYearMonth(reviewer.workPeriodEnd) : ''}
                        </span>
                      </div>
                    </div>
                    {reviewer.evaluation && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">総合評価</p>
                        <p className="text-2xl font-bold">{reviewer.evaluation.overallScore}/100</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
