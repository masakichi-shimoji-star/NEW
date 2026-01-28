'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Save, KeyRound, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/candidate/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          email: data.email || '',
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name }),
      })
      if (response.ok) {
        toast({ title: '保存しました', description: 'プロフィールを更新しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '更新に失敗しました', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: 'エラー', description: '新しいパスワードが一致しません', variant: 'destructive' })
      return
    }
    if (passwords.newPassword.length < 6) {
      toast({ title: 'エラー', description: 'パスワードは6文字以上で入力してください', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/candidate/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })

      if (response.ok) {
        toast({ title: '変更しました', description: 'パスワードを変更しました' })
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        toast({ title: 'エラー', description: data.error || 'パスワードの変更に失敗しました', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: 'パスワードの変更に失敗しました', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/candidate/delete-account', {
        method: 'DELETE',
      })
      if (response.ok) {
        toast({ title: '退会しました' })
        signOut({ callbackUrl: '/' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '退会処理に失敗しました', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">アカウント設定</h1>
        <p className="text-muted-foreground">アカウント情報の管理</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>基本的なアカウント情報</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>氏名</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>メールアドレス</Label>
            <Input value={profile.email} disabled />
            <p className="text-sm text-muted-foreground">メールアドレスは変更できません</p>
          </div>
          <Button onClick={updateProfile} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
          <CardDescription>アカウントのパスワードを変更</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>現在のパスワード</Label>
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>新しいパスワード</Label>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>新しいパスワード（確認）</Label>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />
          </div>
          <Button onClick={changePassword} disabled={isLoading}>
            <KeyRound className="mr-2 h-4 w-4" />
            パスワードを変更
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">退会</CardTitle>
          <CardDescription>アカウントを削除します。この操作は取り消せません。</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                アカウントを削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に退会しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  アカウントを削除すると、すべてのデータ（履歴書、評価者、評価など）が完全に削除されます。
                  この操作は取り消すことができません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground">
                  退会する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          <a href="/terms" className="hover:underline">利用規約</a>
          {' | '}
          <a href="/privacy" className="hover:underline">プライバシーポリシー</a>
        </p>
      </div>
    </div>
  )
}
