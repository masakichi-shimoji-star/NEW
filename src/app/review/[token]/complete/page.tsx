import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function ReviewCompletePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">評価を送信しました</CardTitle>
          <CardDescription>
            ご協力いただきありがとうございました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            あなたの評価は候補者に送信されました。
            候補者の転職活動にご協力いただきありがとうございます。
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            このページを閉じても問題ありません。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
