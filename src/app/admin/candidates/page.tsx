import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, CheckCircle, XCircle } from 'lucide-react'

export default async function AdminCandidatesPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const where: any = { role: 'CANDIDATE' }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { email: { contains: searchParams.q } },
    ]
  }

  const candidates = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      reviewers: {
        include: {
          evaluation: true,
        },
      },
      publicUrls: true,
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">候補者管理</h1>

      <form className="flex gap-4">
        <Input
          name="q"
          placeholder="名前やメールで検索"
          defaultValue={searchParams.q}
          className="max-w-xs"
        />
        <Button type="submit">検索</Button>
      </form>

      <div className="space-y-4">
        {candidates.map((candidate) => {
          const completedEvaluations = candidate.reviewers.filter(
            r => r.status === 'COMPLETED' && r.evaluation
          ).length
          const activePublicUrl = candidate.publicUrls.find(p => p.isActive)

          return (
            <Card key={candidate.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{candidate.name}</h3>
                      {candidate.onboardingCompleted ? (
                        <Badge variant="default">オンボーディング完了</Badge>
                      ) : (
                        <Badge variant="secondary">未完了</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>評価者: {candidate.reviewers.length}人</span>
                      <span>回答済評価: {completedEvaluations}件</span>
                      <span className="flex items-center gap-1">
                        公開URL:
                        {activePublicUrl ? (
                          <><CheckCircle className="h-4 w-4 text-green-500" /> 有効</>
                        ) : (
                          <><XCircle className="h-4 w-4 text-gray-400" /> 無効/未発行</>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      登録日: {new Date(candidate.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                    <Link href={`/admin/candidates/${candidate.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        詳細
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
