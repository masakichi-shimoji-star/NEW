'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2, Eye, Save } from 'lucide-react'
import { getSchoolTypeLabel } from '@/lib/utils'

interface Education {
  id: string
  schoolType: string
  schoolName: string
  faculty: string | null
  department: string | null
  enrollmentDate: string
  graduationDate: string | null
  isEnrolled: boolean
  major: string | null
}

interface WorkHistory {
  id: string
  companyName: string
  department: string | null
  employmentType: string
  startDate: string
  endDate: string | null
  isCurrentJob: boolean
  position: string | null
  jobCategory: string | null
  responsibilities: string
  achievements: string | null
  skills: string | null
}

interface Skill {
  id: string
  name: string
  level: number
  yearsOfExperience: number | null
}

interface Qualification {
  id: string
  name: string
  acquiredDate: string
}

interface Profile {
  name: string
  nameKana: string | null
  email: string
  phone: string | null
  address: string | null
  photo: string | null
  selfPr: string | null
}

interface DesiredCondition {
  desiredJobType: string | null
  desiredLocation: string | null
  desiredSalary: string | null
  availableDate: string | null
}

export default function ResumePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [educations, setEducations] = useState<Education[]>([])
  const [workHistories, setWorkHistories] = useState<WorkHistory[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [desiredCondition, setDesiredCondition] = useState<DesiredCondition | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileRes, educationsRes, workHistoriesRes, skillsRes, qualificationsRes, desiredRes] = await Promise.all([
        fetch('/api/candidate/profile'),
        fetch('/api/candidate/educations'),
        fetch('/api/candidate/work-histories'),
        fetch('/api/candidate/skills'),
        fetch('/api/candidate/qualifications'),
        fetch('/api/candidate/desired-conditions'),
      ])

      if (profileRes.ok) setProfile(await profileRes.json())
      if (educationsRes.ok) setEducations(await educationsRes.json())
      if (workHistoriesRes.ok) setWorkHistories(await workHistoriesRes.json())
      if (skillsRes.ok) setSkills(await skillsRes.json())
      if (qualificationsRes.ok) setQualifications(await qualificationsRes.json())
      if (desiredRes.ok) {
        const data = await desiredRes.json()
        if (data) setDesiredCondition(data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const saveProfile = async () => {
    if (!profile) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (response.ok) {
        toast({ title: '保存しました', description: '基本情報を更新しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '保存に失敗しました', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const addEducation = async () => {
    const newEducation = {
      schoolType: 'UNIVERSITY',
      schoolName: '',
      faculty: '',
      department: '',
      enrollmentDate: '',
      graduationDate: '',
      isEnrolled: false,
      major: '',
    }
    try {
      const response = await fetch('/api/candidate/educations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEducation,
          enrollmentDate: new Date().toISOString(),
        }),
      })
      if (response.ok) {
        const created = await response.json()
        setEducations([...educations, created])
      }
    } catch (error) {
      toast({ title: 'エラー', description: '追加に失敗しました', variant: 'destructive' })
    }
  }

  const updateEducation = async (id: string, data: Partial<Education>) => {
    const edu = educations.find(e => e.id === id)
    if (!edu) return

    try {
      const response = await fetch(`/api/candidate/educations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...edu, ...data }),
      })
      if (response.ok) {
        setEducations(educations.map(e => e.id === id ? { ...e, ...data } : e))
        toast({ title: '保存しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '更新に失敗しました', variant: 'destructive' })
    }
  }

  const deleteEducation = async (id: string) => {
    try {
      const response = await fetch(`/api/candidate/educations/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setEducations(educations.filter(e => e.id !== id))
        toast({ title: '削除しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '削除に失敗しました', variant: 'destructive' })
    }
  }

  const addWorkHistory = async () => {
    try {
      const response = await fetch('/api/candidate/work-histories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: '',
          employmentType: '正社員',
          startDate: new Date().toISOString(),
          isCurrentJob: false,
          responsibilities: '',
        }),
      })
      if (response.ok) {
        const created = await response.json()
        setWorkHistories([...workHistories, created])
      }
    } catch (error) {
      toast({ title: 'エラー', description: '追加に失敗しました', variant: 'destructive' })
    }
  }

  const updateWorkHistory = async (id: string, data: Partial<WorkHistory>) => {
    const work = workHistories.find(w => w.id === id)
    if (!work) return

    try {
      const response = await fetch(`/api/candidate/work-histories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...work, ...data }),
      })
      if (response.ok) {
        setWorkHistories(workHistories.map(w => w.id === id ? { ...w, ...data } : w))
        toast({ title: '保存しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '更新に失敗しました', variant: 'destructive' })
    }
  }

  const deleteWorkHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/candidate/work-histories/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setWorkHistories(workHistories.filter(w => w.id !== id))
        toast({ title: '削除しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '削除に失敗しました', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">履歴書</h1>
          <p className="text-muted-foreground">履歴書の編集・管理</p>
        </div>
        <Link href="/resume/preview">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            プレビュー
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="education">学歴</TabsTrigger>
          <TabsTrigger value="work">職歴</TabsTrigger>
          <TabsTrigger value="skills">スキル・資格</TabsTrigger>
          <TabsTrigger value="pr">自己PR</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>氏名</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>氏名（カナ）</Label>
                      <Input
                        value={profile.nameKana || ''}
                        onChange={(e) => setProfile({ ...profile, nameKana: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>メールアドレス</Label>
                      <Input value={profile.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>電話番号</Label>
                      <Input
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>居住地</Label>
                    <Input
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </div>
                  <Button onClick={saveProfile} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          {educations.map((edu, index) => (
            <Card key={edu.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">学歴 {index + 1}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => deleteEducation(edu.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>学校区分</Label>
                    <Select
                      value={edu.schoolType}
                      onValueChange={(value) => updateEducation(edu.id, { schoolType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH_SCHOOL">高校</SelectItem>
                        <SelectItem value="TECHNICAL_COLLEGE">高専</SelectItem>
                        <SelectItem value="VOCATIONAL_SCHOOL">専門学校</SelectItem>
                        <SelectItem value="JUNIOR_COLLEGE">短大</SelectItem>
                        <SelectItem value="UNIVERSITY">大学</SelectItem>
                        <SelectItem value="GRADUATE_SCHOOL">大学院</SelectItem>
                        <SelectItem value="OTHER">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>学校名</Label>
                    <Input
                      value={edu.schoolName}
                      onChange={(e) => updateEducation(edu.id, { schoolName: e.target.value })}
                      onBlur={() => updateEducation(edu.id, {})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>学部</Label>
                    <Input
                      value={edu.faculty || ''}
                      onChange={(e) => setEducations(educations.map(e => e.id === edu.id ? { ...e, faculty: e.target.value } : e))}
                      onBlur={(e) => updateEducation(edu.id, { faculty: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>学科</Label>
                    <Input
                      value={edu.department || ''}
                      onChange={(e) => setEducations(educations.map(ed => ed.id === edu.id ? { ...ed, department: e.target.value } : ed))}
                      onBlur={(e) => updateEducation(edu.id, { department: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addEducation} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            学歴を追加
          </Button>
        </TabsContent>

        <TabsContent value="work" className="space-y-4">
          {workHistories.map((work, index) => (
            <Card key={work.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">職歴 {index + 1}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => deleteWorkHistory(work.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>会社名</Label>
                    <Input
                      value={work.companyName}
                      onChange={(e) => setWorkHistories(workHistories.map(w => w.id === work.id ? { ...w, companyName: e.target.value } : w))}
                      onBlur={(e) => updateWorkHistory(work.id, { companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>所属部署</Label>
                    <Input
                      value={work.department || ''}
                      onChange={(e) => setWorkHistories(workHistories.map(w => w.id === work.id ? { ...w, department: e.target.value } : w))}
                      onBlur={(e) => updateWorkHistory(work.id, { department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>担当業務</Label>
                  <Textarea
                    value={work.responsibilities}
                    onChange={(e) => setWorkHistories(workHistories.map(w => w.id === work.id ? { ...w, responsibilities: e.target.value } : w))}
                    onBlur={(e) => updateWorkHistory(work.id, { responsibilities: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>実績・成果</Label>
                  <Textarea
                    value={work.achievements || ''}
                    onChange={(e) => setWorkHistories(workHistories.map(w => w.id === work.id ? { ...w, achievements: e.target.value } : w))}
                    onBlur={(e) => updateWorkHistory(work.id, { achievements: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addWorkHistory} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            職歴を追加
          </Button>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>スキル</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{skill.name}</span>
                    <span className="text-muted-foreground">Lv.{skill.level}</span>
                  </div>
                ))}
                {skills.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">スキルが登録されていません</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>資格</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {qualifications.map((qual) => (
                  <div key={qual.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{qual.name}</span>
                    <span className="text-muted-foreground">{new Date(qual.acquiredDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}</span>
                  </div>
                ))}
                {qualifications.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">資格が登録されていません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>自己PR</CardTitle>
            </CardHeader>
            <CardContent>
              {profile && (
                <div className="space-y-4">
                  <Textarea
                    value={profile.selfPr || ''}
                    onChange={(e) => setProfile({ ...profile, selfPr: e.target.value })}
                    rows={10}
                    placeholder="あなたの強みや経験、キャリアビジョンについて記載してください"
                  />
                  <Button onClick={saveProfile} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
