import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Share2, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">WorkView</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button>新規登録</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          あなたの実力を
          <br />
          <span className="text-primary">第三者の声</span>で証明する
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          WorkViewは、過去の同僚や上司からのリファレンス（評価）を収集し、
          あなたの実績を客観的に証明できるプラットフォームです。
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              無料で始める
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="text-lg px-8">
              詳しく見る
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">利用の流れ</h3>
        <div className="grid md:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">1. 履歴書を作成</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                基本情報、学歴、職歴、スキルなどを入力して履歴書を作成します。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">2. 評価を依頼</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                過去の上司や同僚に評価依頼を送り、あなたの仕事ぶりを評価してもらいます。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">3. 評価を受け取る</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                評価者があなたの強み、実績、人物像を詳細に記入します。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">4. 企業に共有</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                公開URLを発行して、応募先企業にあなたの情報を共有できます。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">WorkViewの特徴</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-4">詳細な評価フォーム</h4>
              <p className="text-gray-600">
                数値評価、具体的なエピソード、強み・リスク分析など、多角的な視点からの評価を収集できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-4">簡単な依頼・回答</h4>
              <p className="text-gray-600">
                評価者は専用URLからアクセスするだけ。ログイン不要で手軽に評価を入力できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-4">安心の公開管理</h4>
              <p className="text-gray-600">
                公開URLの有効/無効をいつでも切り替え可能。自分の情報を完全にコントロールできます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-6">今すぐ始めましょう</h3>
        <p className="text-xl text-gray-600 mb-8">
          あなたのキャリアを、客観的な評価で証明しませんか？
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8">
            無料で登録する
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 WorkView. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/terms" className="hover:underline">利用規約</Link>
            <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
