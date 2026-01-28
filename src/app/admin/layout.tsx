import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Users, Star, FileText, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

async function AdminNav() {
  return (
    <nav className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
      <div className="flex items-center gap-2 p-4 border-b border-gray-800">
        <Shield className="h-6 w-6" />
        <span className="font-bold">WorkView Admin</span>
      </div>
      <div className="p-4 space-y-2">
        <Link href="/admin">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            <FileText className="mr-2 h-4 w-4" />
            ダッシュボード
          </Button>
        </Link>
        <Link href="/admin/candidates">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            <Users className="mr-2 h-4 w-4" />
            候補者管理
          </Button>
        </Link>
        <Link href="/admin/evaluations">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            <Star className="mr-2 h-4 w-4" />
            評価管理
          </Button>
        </Link>
        <Link href="/admin/logs">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            <FileText className="mr-2 h-4 w-4" />
            監査ログ
          </Button>
        </Link>
      </div>
    </nav>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/admin/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="ml-64">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-end">
            <form action={async () => {
              'use server'
              const { signOut } = await import('@/lib/auth')
              await signOut({ redirectTo: '/admin/login' })
            }}>
              <Button variant="ghost" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </form>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
