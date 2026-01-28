'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'

const reviewerSchema = z.object({
  name: z.string().min(1, '氏名を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  company: z.string().min(1, '会社名を入力してください'),
  department: z.string().optional(),
  position: z.string().optional(),
  relationship: z.string().min(1, '関係性を選択してください'),
  workPeriodStart: z.string().min(1, '開始年月を入力してください'),
  workPeriodEnd: z.string().optional(),
  isCurrentlyWorking: z.boolean(),
  memo: z.string().optional(),
})

type ReviewerFormData = z.infer<typeof reviewerSchema>

export default function NewReviewerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewerFormData>({
    resolver: zodResolver(reviewerSchema),
    defaultValues: {
      isCurrentlyWorking: false,
    },
  })

  const isCurrentlyWorking = watch('isCurrentlyWorking')
  const relationship = watch('relationship')

  const onSubmit = async (data: ReviewerFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reviewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '登録に失敗しました')
      }

      const reviewer = await response.json()
      toast({
        title: '登録完了',
        description: '評価者を登録しました',
      })
      router.push(`/reviewers/${reviewer.id}`)
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '登録に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reviewers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">評価者を追加</h1>
          <p className="text-muted-foreground">評価を依頼する方の情報を入力</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>評価者情報</CardTitle>
          <CardDescription>
            過去の上司や同僚など、あなたの仕事ぶりを評価できる方の情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">氏名 *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">会社名 *</Label>
                <Input id="company" {...register('company')} />
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">所属部署</Label>
                <Input id="department" {...register('department')} placeholder="なしの場合は空欄" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">役職</Label>
                <Input id="position" {...register('position')} placeholder="なしの場合は空欄" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">関係性 *</Label>
                <Select
                  value={relationship}
                  onValueChange={(value) => setValue('relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPERVISOR">上司</SelectItem>
                    <SelectItem value="COLLEAGUE">同僚</SelectItem>
                    <SelectItem value="SUBORDINATE">部下</SelectItem>
                    <SelectItem value="CLIENT">取引先</SelectItem>
                    <SelectItem value="OTHER">その他</SelectItem>
                  </SelectContent>
                </Select>
                {errors.relationship && (
                  <p className="text-sm text-destructive">{errors.relationship.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workPeriodStart">一緒に働いた期間（開始）*</Label>
                <Input id="workPeriodStart" type="month" {...register('workPeriodStart')} />
                {errors.workPeriodStart && (
                  <p className="text-sm text-destructive">{errors.workPeriodStart.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workPeriodEnd">一緒に働いた期間（終了）</Label>
                <Input
                  id="workPeriodEnd"
                  type="month"
                  {...register('workPeriodEnd')}
                  disabled={isCurrentlyWorking}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCurrentlyWorking"
                checked={isCurrentlyWorking}
                onCheckedChange={(checked) => setValue('isCurrentlyWorking', checked === true)}
              />
              <Label htmlFor="isCurrentlyWorking">現在も一緒に働いている</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">メモ（任意）</Label>
              <Textarea
                id="memo"
                {...register('memo')}
                placeholder="依頼時に参考にするメモなど"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/reviewers">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '登録中...' : '登録する'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
