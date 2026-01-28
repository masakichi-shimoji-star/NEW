'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Ban, CheckCircle, XCircle, Star } from 'lucide-react'
import { getRelationshipLabel, formatYearMonth, formatDate } from '@/lib/utils'

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

export default function AdminEvaluationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [evaluation, setEvaluation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [excludeReason, setExcludeReason] = useState('')

  useEffect(() => {
    loadEvaluation()
  }, [params.id])

  const loadEvaluation = async () => {
    try {
      const response = await fetch(`/api/admin/evaluations/${params.id}`)
      if (!response.ok) {
        router.push('/admin/evaluations')
        return
      }
      const data = await response.json()
      setEvaluation(data)
      setExcludeReason(data.excludeReason || '')
    } catch (error) {
      console.error('Failed to load evaluation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExclude = async () => {
    try {
      const response = await fetch(`/api/admin/evaluations/${params.id}/exclude`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isExcluded: !evaluation.isExcluded,
          excludeReason: evaluation.isExcluded ? '' : excludeReason,
        }),
      })
      if (response.ok) {
        const updated = await response.json()
        setEvaluation(updated)
        toast({
          title: updated.isExcluded ? '除外しました' : '公開に戻しました',
        })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '更新に失敗しました', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">読み込み中...</div>
  }

  if (!evaluation) {
    return <div className="flex items-center justify-center h-64">評価が見つかりません</div>
  }

  const reviewer = evaluation.reviewer
  const numerical = evaluation.numericalEvaluations ? JSON.parse(evaluation.numericalEvaluations) : null
  const episode1 = evaluation.episode1 ? JSON.parse(evaluation.episode1) : null
  const episode2 = evaluation.episode2 ? JSON.parse(evaluation.episode2) : null
  const episode3 = evaluation.episode3 ? JSON.parse(evaluation.episode3) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/evaluations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">評価詳細</h1>
            <p className="text-muted-foreground">
              {reviewer.candidate.name}さんへの評価（{reviewer.name}）
            </p>
          </div>
        </div>
        <Badge variant={evaluation.isExcluded ? 'destructive' : 'default'}>
          {evaluation.isExcluded ? (
            <><Ban className="mr-1 h-3 w-3" /> 除外中</>
          ) : (
            <><CheckCircle className="mr-1 h-3 w-3" /> 公開中</>
          )}
        </Badge>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>公開制御</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>除外理由（除外する場合）</Label>
            <Textarea
              value={excludeReason}
              onChange={(e) => setExcludeReason(e.target.value)}
              placeholder="不適切な内容、誹謗中傷など"
              rows={3}
            />
          </div>
          <Button
            variant={evaluation.isExcluded ? 'default' : 'destructive'}
            onClick={toggleExclude}
          >
            {evaluation.isExcluded ? (
              <><CheckCircle className="mr-2 h-4 w-4" /> 公開に戻す</>
            ) : (
              <><Ban className="mr-2 h-4 w-4" /> 企業ページから除外</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Reviewer Info */}
      <Card>
        <CardHeader>
          <CardTitle>評価者情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">氏名</p>
              <p className="font-medium">{reviewer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">会社</p>
              <p className="font-medium">{reviewer.company}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">メール</p>
              <p className="font-medium">{reviewer.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">関係性</p>
              <p className="font-medium">{getRelationshipLabel(reviewer.relationship)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle>総合結論</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">総合評価</p>
              <p className="text-4xl font-bold">{evaluation.overallScore}/100</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">推薦度</p>
              <p className="text-4xl font-bold">{evaluation.recommendationScore}/10</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">再び働きたい</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {evaluation.wouldWorkAgain ? (
                  <><CheckCircle className="h-6 w-6 text-green-500" /> Yes</>
                ) : (
                  <><XCircle className="h-6 w-6 text-red-500" /> No</>
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
        </CardContent>
      </Card>

      {/* Numerical Evaluations */}
      {numerical && (
        <Card>
          <CardHeader>
            <CardTitle>数値評価</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(numericalLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span>{label}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (numerical[key] || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2">{numerical[key] || 0}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Episodes */}
      {[episode1, episode2, episode3].map((episode, idx) => (
        episode && (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>エピソード {idx + 1}: {episode.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {episode.background && (
                <div>
                  <p className="text-sm text-muted-foreground">目的・背景</p>
                  <p className="whitespace-pre-wrap">{episode.background}</p>
                </div>
              )}
              {episode.role && (
                <div>
                  <p className="text-sm text-muted-foreground">役割</p>
                  <p className="whitespace-pre-wrap">{episode.role}</p>
                </div>
              )}
              {episode.actions && (
                <div>
                  <p className="text-sm text-muted-foreground">行動</p>
                  <p className="whitespace-pre-wrap">{episode.actions}</p>
                </div>
              )}
              {episode.results && (
                <div>
                  <p className="text-sm text-muted-foreground">成果</p>
                  <p className="whitespace-pre-wrap">{episode.results}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      ))}

      {/* Cross-sectional */}
      <Card>
        <CardHeader>
          <CardTitle>横断評価</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Overall Personality */}
      {evaluation.overallPersonality && (
        <Card>
          <CardHeader>
            <CardTitle>総合人物像</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{evaluation.overallPersonality}</p>
          </CardContent>
        </Card>
      )}

      {/* Final Checks */}
      <Card>
        <CardHeader>
          <CardTitle>最終チェック</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
