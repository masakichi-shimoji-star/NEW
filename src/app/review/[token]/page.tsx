import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, FileText, AlertTriangle } from 'lucide-react'

export default async function ReviewEntryPage({
  params,
}: {
  params: { token: string }
}) {
  const reviewer = await prisma.reviewer.findUnique({
    where: { token: params.token },
    include: {
      candidate: {
        select: { name: true },
      },
      evaluation: true,
    },
  })

  if (!reviewer) {
    notFound()
  }

  // If already completed and cannot edit
  if (reviewer.evaluation && !reviewer.evaluation.isDraft && !reviewer.evaluation.canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle>評価は既に完了しています</CardTitle>
            <CardDescription>
              この評価は既に送信済みです。ご協力ありがとうございました。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">評価依頼</CardTitle>
            <CardDescription>
              {reviewer.candidate.name}さんからの評価依頼です
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                {reviewer.candidate.name}さんは、転職活動にあたり、過去一緒に働いた方からの評価を収集しています。
                以下のフォームから、{reviewer.candidate.name}さんの仕事ぶりについて評価をお願いいたします。
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">所要時間</p>
                  <p className="text-sm text-muted-foreground">約60分程度</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">注意事項</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>事実に基づいて評価してください</li>
                    <li>守秘義務に配慮してください</li>
                    <li>誹謗中傷は避けてください</li>
                    <li>途中保存が可能です</li>
                  </ul>
                </div>
              </div>
            </div>

            {reviewer.evaluation?.isDraft && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  前回の入力途中のデータがあります。続きから入力できます。
                </p>
              </div>
            )}

            <Link href={`/review/${params.token}/form`}>
              <Button className="w-full" size="lg">
                {reviewer.evaluation?.isDraft ? '続きから入力する' : '評価を開始する'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
