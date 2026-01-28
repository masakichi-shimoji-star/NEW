'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Copy, Mail, ExternalLink, Check } from 'lucide-react'
import { getRelationshipLabel, getReviewerStatusLabel, getReviewerStatusColor } from '@/lib/utils'

interface Reviewer {
  id: string
  name: string
  email: string
  company: string
  department: string | null
  position: string | null
  relationship: string
  workPeriodStart: string
  workPeriodEnd: string | null
  isCurrentlyWorking: boolean
  memo: string | null
  token: string
  status: string
  evaluation: {
    id: string
    overallScore: number | null
  } | null
}

export default function ReviewerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [reviewer, setReviewer] = useState<Reviewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isUrlCopied, setIsUrlCopied] = useState(false)

  // Request message state
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  useEffect(() => {
    loadReviewer()
  }, [params.id])

  const loadReviewer = async () => {
    try {
      const response = await fetch(`/api/reviewers/${params.id}`)
      if (!response.ok) {
        router.push('/reviewers')
        return
      }
      const data = await response.json()
      setReviewer(data)
      generateRequestMessage(data)
    } catch (error) {
      console.error('Failed to load reviewer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRequestMessage = (reviewer: Reviewer) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const reviewUrl = `${appUrl}/review/${reviewer.token}`

    const subject = `【評価依頼】WorkViewでの評価入力のお願い`
    const body = `${reviewer.name}様

お忙しいところ恐れ入ります。

この度、転職活動にあたり、過去一緒に働いた方からの評価を収集できるサービス「WorkView」を利用しております。

${reviewer.name}様には、私の仕事ぶりについて評価をいただきたく、ご連絡させていただきました。

以下のURLから評価フォームにアクセスできます。
所要時間は60分程度を想定しております。

評価フォームURL:
${reviewUrl}

お忙しい中恐縮ですが、ご協力いただけますと幸いです。
何かご不明な点がございましたら、お気軽にお問い合わせください。

何卒よろしくお願いいたします。`

    setEmailSubject(subject)
    setEmailBody(body)
  }

  const copyBody = async () => {
    await navigator.clipboard.writeText(emailBody)
    setIsCopied(true)
    toast({ title: 'コピーしました', description: '本文をクリップボードにコピーしました' })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const copyUrl = async () => {
    if (!reviewer) return
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const reviewUrl = `${appUrl}/review/${reviewer.token}`
    await navigator.clipboard.writeText(reviewUrl)
    setIsUrlCopied(true)
    toast({ title: 'コピーしました', description: 'URLをクリップボードにコピーしました' })
    setTimeout(() => setIsUrlCopied(false), 2000)
  }

  const updateStatus = async (status: string) => {
    if (!reviewer) return
    try {
      const response = await fetch(`/api/reviewers/${reviewer.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        setReviewer({ ...reviewer, status })
        toast({ title: 'ステータスを更新しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '更新に失敗しました', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">読み込み中...</div>
  }

  if (!reviewer) {
    return <div className="flex items-center justify-center h-64">評価者が見つかりません</div>
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const reviewUrl = `${appUrl}/review/${reviewer.token}`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reviewers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{reviewer.name}</h1>
            <Badge className={getReviewerStatusColor(reviewer.status)}>
              {getReviewerStatusLabel(reviewer.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {reviewer.company}
            {reviewer.department && ` / ${reviewer.department}`}
            {reviewer.position && ` / ${reviewer.position}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reviewer Info */}
        <Card>
          <CardHeader>
            <CardTitle>評価者情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">メールアドレス</Label>
                <p>{reviewer.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">関係性</Label>
                <p>{getRelationshipLabel(reviewer.relationship)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">会社名</Label>
                <p>{reviewer.company}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">部署</Label>
                <p>{reviewer.department || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">役職</Label>
                <p>{reviewer.position || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">共同期間</Label>
                <p>
                  {new Date(reviewer.workPeriodStart).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                  {' - '}
                  {reviewer.isCurrentlyWorking ? '現在' : reviewer.workPeriodEnd ? new Date(reviewer.workPeriodEnd).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }) : ''}
                </p>
              </div>
            </div>
            {reviewer.memo && (
              <div>
                <Label className="text-muted-foreground">メモ</Label>
                <p className="whitespace-pre-wrap">{reviewer.memo}</p>
              </div>
            )}

            <Separator />

            <div>
              <Label className="text-muted-foreground">ステータス変更</Label>
              <div className="flex gap-2 mt-2">
                <Select value={reviewer.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_SENT">未送信</SelectItem>
                    <SelectItem value="SENT">送信済</SelectItem>
                    <SelectItem value="IN_PROGRESS">回答中</SelectItem>
                    <SelectItem value="COMPLETED">回答済</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Message */}
        <Card>
          <CardHeader>
            <CardTitle>依頼文</CardTitle>
            <CardDescription>
              評価者に送信する依頼メールの内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>件名</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>本文</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
              />
            </div>
            <div className="space-y-2">
              <Label>評価フォームURL</Label>
              <div className="flex gap-2">
                <Input value={reviewUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {isUrlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Link href={reviewUrl} target="_blank">
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyBody} className="flex-1">
                {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                本文をコピー（リンク付き）
              </Button>
              <Button variant="outline" onClick={copyUrl}>
                {isUrlCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                URLをコピー
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              依頼文をコピーして、メールやメッセージアプリで評価者に送信してください。
              送信後は「送信済み」にステータスを変更してください。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Result */}
      {reviewer.evaluation && (
        <Card>
          <CardHeader>
            <CardTitle>評価結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">総合評価</p>
                <p className="text-4xl font-bold">{reviewer.evaluation.overallScore}/100</p>
              </div>
              <Link href={`/evaluations/${reviewer.evaluation.id}`}>
                <Button>評価詳細を見る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
