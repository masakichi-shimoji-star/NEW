import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Star, Link as LinkIcon, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reviewers: {
        include: {
          evaluation: true,
        },
      },
      publicUrls: true,
    },
  })

  if (!user) redirect('/login')

  // Check if onboarding is completed
  if (!user.onboardingCompleted) {
    redirect('/onboarding')
  }

  // Calculate stats
  const totalReviewers = user.reviewers.length
  const completedEvaluations = user.reviewers.filter(r => r.status === 'COMPLETED').length
  const pendingEvaluations = user.reviewers.filter(r => r.status === 'SENT' || r.status === 'IN_PROGRESS').length
  const notSentRequests = user.reviewers.filter(r => r.status === 'NOT_SENT').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          ようこそ、{user.name}さん
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">評価依頼数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviewers}</div>
            <p className="text-xs text-muted-foreground">
              登録済み評価者
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">回答済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              回答完了の評価
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">回答待ち</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              送信済み・回答中
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未送信</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notSentRequests}</div>
            <p className="text-xs text-muted-foreground">
              依頼文未送信
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              履歴書
            </CardTitle>
            <CardDescription>
              履歴書の編集・プレビュー
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/resume">
              <Button className="w-full">
                履歴書を編集
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              評価依頼
            </CardTitle>
            <CardDescription>
              評価者を追加して依頼を送信
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reviewers/new">
              <Button className="w-full">
                評価者を追加
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              公開URL
            </CardTitle>
            <CardDescription>
              企業向け公開URLの管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/public-url">
              <Button className="w-full" variant="outline">
                URL管理
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      {completedEvaluations > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              最近の評価
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.reviewers
                .filter(r => r.status === 'COMPLETED' && r.evaluation)
                .slice(0, 3)
                .map((reviewer) => (
                  <div key={reviewer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reviewer.company} / {reviewer.position || '役職なし'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {reviewer.evaluation && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">総合評価</p>
                          <p className="text-lg font-bold">{reviewer.evaluation.overallScore}/100</p>
                        </div>
                      )}
                      <Link href={`/evaluations/${reviewer.evaluation?.id}`}>
                        <Button variant="outline" size="sm">
                          詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
            {completedEvaluations > 3 && (
              <div className="mt-4 text-center">
                <Link href="/evaluations">
                  <Button variant="link">すべての評価を見る</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
