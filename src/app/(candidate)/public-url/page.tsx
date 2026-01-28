'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Copy, ExternalLink, RefreshCw, Check, Eye, EyeOff } from 'lucide-react'

interface PublicUrl {
  id: string
  token: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PublicUrlPage() {
  const { toast } = useToast()
  const [publicUrl, setPublicUrl] = useState<PublicUrl | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    loadPublicUrl()
  }, [])

  const loadPublicUrl = async () => {
    try {
      const response = await fetch('/api/public-url')
      if (response.ok) {
        const data = await response.json()
        setPublicUrl(data)
      }
    } catch (error) {
      console.error('Failed to load public URL:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPublicUrl = async () => {
    try {
      const response = await fetch('/api/public-url', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setPublicUrl(data)
        toast({ title: '公開URLを発行しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '発行に失敗しました', variant: 'destructive' })
    }
  }

  const toggleActive = async () => {
    if (!publicUrl) return
    try {
      const response = await fetch(`/api/public-url/${publicUrl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !publicUrl.isActive }),
      })
      if (response.ok) {
        setPublicUrl({ ...publicUrl, isActive: !publicUrl.isActive })
        toast({
          title: publicUrl.isActive ? '公開を無効化しました' : '公開を有効化しました',
        })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '更新に失敗しました', variant: 'destructive' })
    }
  }

  const regenerateUrl = async () => {
    if (!publicUrl) return
    try {
      const response = await fetch(`/api/public-url/${publicUrl.id}/regenerate`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setPublicUrl(data)
        toast({ title: '新しいURLを発行しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '再発行に失敗しました', variant: 'destructive' })
    }
  }

  const copyUrl = async () => {
    if (!publicUrl) return
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const url = `${appUrl}/public/${publicUrl.token}`
    await navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast({ title: 'コピーしました', description: 'URLをクリップボードにコピーしました' })
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">読み込み中...</div>
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const fullUrl = publicUrl ? `${appUrl}/public/${publicUrl.token}` : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">公開URL管理</h1>
        <p className="text-muted-foreground">企業向けに公開するURLの管理</p>
      </div>

      {!publicUrl ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ExternalLink className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">公開URLが未発行です</h3>
            <p className="text-muted-foreground mb-4">
              公開URLを発行すると、企業があなたの履歴書と評価を閲覧できるようになります
            </p>
            <Button onClick={createPublicUrl}>
              公開URLを発行する
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>公開URL</CardTitle>
                  <CardDescription>
                    このURLを企業に共有してください
                  </CardDescription>
                </div>
                <Badge variant={publicUrl.isActive ? 'default' : 'secondary'}>
                  {publicUrl.isActive ? (
                    <>
                      <Eye className="mr-1 h-3 w-3" />
                      公開中
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-1 h-3 w-3" />
                      非公開
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={fullUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Link href={fullUrl} target="_blank">
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex gap-4">
                <Button onClick={copyUrl} className="flex-1">
                  {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  URLをコピー
                </Button>
                <Link href={fullUrl} target="_blank" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    プレビュー
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>公開設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">公開状態</p>
                  <p className="text-sm text-muted-foreground">
                    {publicUrl.isActive
                      ? '現在、企業がこのURLから情報を閲覧できます'
                      : '現在、このURLは無効化されており閲覧できません'}
                  </p>
                </div>
                <Button
                  variant={publicUrl.isActive ? 'destructive' : 'default'}
                  onClick={toggleActive}
                >
                  {publicUrl.isActive ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      無効化する
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      有効化する
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="font-medium">URLの再発行</p>
                  <p className="text-sm text-muted-foreground">
                    新しいURLを発行します。古いURLは無効になります
                  </p>
                </div>
                <Button variant="outline" onClick={regenerateUrl}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  再発行
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>公開される情報</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  プロフィール写真
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  基本情報（氏名、連絡先など）
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  学歴
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  職歴
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  スキル・資格
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  自己PR
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  評価者からの評価（全文）
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
