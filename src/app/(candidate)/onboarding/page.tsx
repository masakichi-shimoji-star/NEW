'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const steps = [
  { id: 1, name: '基本情報' },
  { id: 2, name: '学歴' },
  { id: 3, name: '職歴' },
  { id: 4, name: 'スキル・資格' },
  { id: 5, name: '自己PR' },
]

const basicInfoSchema = z.object({
  name: z.string().min(1, '氏名を入力してください'),
  nameKana: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type BasicInfoFormData = z.infer<typeof basicInfoSchema>

interface Education {
  id: string
  schoolType: string
  schoolName: string
  faculty: string
  department: string
  enrollmentDate: string
  graduationDate: string
  isEnrolled: boolean
  major: string
}

interface WorkHistory {
  id: string
  companyName: string
  department: string
  employmentType: string
  startDate: string
  endDate: string
  isCurrentJob: boolean
  position: string
  jobCategory: string
  responsibilities: string
  achievements: string
  skills: string
}

interface Skill {
  id: string
  name: string
  level: number
  yearsOfExperience: number
}

interface Qualification {
  id: string
  name: string
  acquiredDate: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormData>({
    name: '',
    nameKana: '',
    phone: '',
    address: '',
  })

  // Step 2: Education
  const [educations, setEducations] = useState<Education[]>([])

  // Step 3: Work History
  const [workHistories, setWorkHistories] = useState<WorkHistory[]>([])

  // Step 4: Skills & Qualifications
  const [skills, setSkills] = useState<Skill[]>([])
  const [qualifications, setQualifications] = useState<Qualification[]>([])

  // Step 5: Self PR
  const [selfPr, setSelfPr] = useState('')
  const [desiredConditions, setDesiredConditions] = useState({
    desiredJobType: '',
    desiredLocation: '',
    desiredSalary: '',
    availableDate: '',
  })

  const {
    register: registerBasicInfo,
    handleSubmit: handleSubmitBasicInfo,
    formState: { errors: basicInfoErrors },
    setValue: setBasicInfoValue,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: basicInfo,
  })

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/candidate/profile')
        if (response.ok) {
          const data = await response.json()
          setBasicInfo({
            name: data.name || '',
            nameKana: data.nameKana || '',
            phone: data.phone || '',
            address: data.address || '',
          })
          setBasicInfoValue('name', data.name || '')
          setBasicInfoValue('nameKana', data.nameKana || '')
          setBasicInfoValue('phone', data.phone || '')
          setBasicInfoValue('address', data.address || '')
          setSelfPr(data.selfPr || '')
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }
    loadData()
  }, [setBasicInfoValue])

  const progress = (currentStep / steps.length) * 100

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        schoolType: '',
        schoolName: '',
        faculty: '',
        department: '',
        enrollmentDate: '',
        graduationDate: '',
        isEnrolled: false,
        major: '',
      },
    ])
  }

  const removeEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setEducations(
      educations.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  const addWorkHistory = () => {
    setWorkHistories([
      ...workHistories,
      {
        id: Date.now().toString(),
        companyName: '',
        department: '',
        employmentType: '',
        startDate: '',
        endDate: '',
        isCurrentJob: false,
        position: '',
        jobCategory: '',
        responsibilities: '',
        achievements: '',
        skills: '',
      },
    ])
  }

  const removeWorkHistory = (id: string) => {
    setWorkHistories(workHistories.filter((w) => w.id !== id))
  }

  const updateWorkHistory = (id: string, field: keyof WorkHistory, value: string | boolean) => {
    setWorkHistories(
      workHistories.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    )
  }

  const addSkill = () => {
    setSkills([
      ...skills,
      {
        id: Date.now().toString(),
        name: '',
        level: 3,
        yearsOfExperience: 0,
      },
    ])
  }

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id))
  }

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setSkills(
      skills.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        id: Date.now().toString(),
        name: '',
        acquiredDate: '',
      },
    ])
  }

  const removeQualification = (id: string) => {
    setQualifications(qualifications.filter((q) => q.id !== id))
  }

  const updateQualification = (id: string, field: keyof Qualification, value: string) => {
    setQualifications(
      qualifications.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  const saveDraft = async () => {
    setIsLoading(true)
    try {
      // Save all data
      await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basicInfo,
          selfPr,
        }),
      })

      toast({
        title: '保存しました',
        description: '入力内容を一時保存しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      // Save profile
      await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basicInfo,
          selfPr,
        }),
      })

      // Save educations
      for (const edu of educations) {
        if (edu.schoolName) {
          await fetch('/api/candidate/educations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(edu),
          })
        }
      }

      // Save work histories
      for (const work of workHistories) {
        if (work.companyName) {
          await fetch('/api/candidate/work-histories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(work),
          })
        }
      }

      // Save skills
      for (const skill of skills) {
        if (skill.name) {
          await fetch('/api/candidate/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(skill),
          })
        }
      }

      // Save qualifications
      for (const qual of qualifications) {
        if (qual.name) {
          await fetch('/api/candidate/qualifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(qual),
          })
        }
      }

      // Save desired conditions
      if (Object.values(desiredConditions).some(v => v)) {
        await fetch('/api/candidate/desired-conditions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(desiredConditions),
        })
      }

      // Complete onboarding
      await fetch('/api/candidate/complete-onboarding', {
        method: 'POST',
      })

      toast({
        title: '完了しました',
        description: 'オンボーディングが完了しました',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '完了処理に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBasicInfoSubmit = (data: BasicInfoFormData) => {
    setBasicInfo(data)
    setCurrentStep(2)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmitBasicInfo(handleBasicInfoSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">氏名 *</Label>
              <Input id="name" {...registerBasicInfo('name')} />
              {basicInfoErrors.name && (
                <p className="text-sm text-destructive">{basicInfoErrors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameKana">氏名（カナ）</Label>
              <Input id="nameKana" {...registerBasicInfo('nameKana')} placeholder="ヤマダ タロウ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input id="phone" type="tel" {...registerBasicInfo('phone')} placeholder="090-1234-5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">居住地</Label>
              <Input id="address" {...registerBasicInfo('address')} placeholder="東京都渋谷区" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit">
                次へ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )

      case 2:
        return (
          <div className="space-y-4">
            {educations.map((edu, index) => (
              <Card key={edu.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">学歴 {index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>学校区分 *</Label>
                      <Select
                        value={edu.schoolType}
                        onValueChange={(value) => updateEducation(edu.id, 'schoolType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
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
                      <Label>学校名 *</Label>
                      <Input
                        value={edu.schoolName}
                        onChange={(e) => updateEducation(edu.id, 'schoolName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>学部</Label>
                      <Input
                        value={edu.faculty}
                        onChange={(e) => updateEducation(edu.id, 'faculty', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>学科</Label>
                      <Input
                        value={edu.department}
                        onChange={(e) => updateEducation(edu.id, 'department', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>入学年月 *</Label>
                      <Input
                        type="month"
                        value={edu.enrollmentDate}
                        onChange={(e) => updateEducation(edu.id, 'enrollmentDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>卒業年月</Label>
                      <Input
                        type="month"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                        disabled={edu.isEnrolled}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`enrolled-${edu.id}`}
                      checked={edu.isEnrolled}
                      onCheckedChange={(checked) => updateEducation(edu.id, 'isEnrolled', checked === true)}
                    />
                    <Label htmlFor={`enrolled-${edu.id}`}>在学中</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>専攻・研究テーマ</Label>
                    <Input
                      value={edu.major}
                      onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addEducation} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              学歴を追加
            </Button>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                次へ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            {workHistories.map((work, index) => (
              <Card key={work.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">職歴 {index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWorkHistory(work.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>会社名 *</Label>
                      <Input
                        value={work.companyName}
                        onChange={(e) => updateWorkHistory(work.id, 'companyName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>所属部署</Label>
                      <Input
                        value={work.department}
                        onChange={(e) => updateWorkHistory(work.id, 'department', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>雇用形態 *</Label>
                      <Select
                        value={work.employmentType}
                        onValueChange={(value) => updateWorkHistory(work.id, 'employmentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="正社員">正社員</SelectItem>
                          <SelectItem value="契約社員">契約社員</SelectItem>
                          <SelectItem value="派遣社員">派遣社員</SelectItem>
                          <SelectItem value="パート・アルバイト">パート・アルバイト</SelectItem>
                          <SelectItem value="業務委託">業務委託</SelectItem>
                          <SelectItem value="その他">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>役職</Label>
                      <Input
                        value={work.position}
                        onChange={(e) => updateWorkHistory(work.id, 'position', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>開始年月 *</Label>
                      <Input
                        type="month"
                        value={work.startDate}
                        onChange={(e) => updateWorkHistory(work.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>終了年月</Label>
                      <Input
                        type="month"
                        value={work.endDate}
                        onChange={(e) => updateWorkHistory(work.id, 'endDate', e.target.value)}
                        disabled={work.isCurrentJob}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`current-${work.id}`}
                      checked={work.isCurrentJob}
                      onCheckedChange={(checked) => updateWorkHistory(work.id, 'isCurrentJob', checked === true)}
                    />
                    <Label htmlFor={`current-${work.id}`}>在籍中</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>職種カテゴリ</Label>
                    <Select
                      value={work.jobCategory}
                      onValueChange={(value) => updateWorkHistory(work.id, 'jobCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="エンジニア">エンジニア</SelectItem>
                        <SelectItem value="営業">営業</SelectItem>
                        <SelectItem value="マーケティング">マーケティング</SelectItem>
                        <SelectItem value="人事">人事</SelectItem>
                        <SelectItem value="経理・財務">経理・財務</SelectItem>
                        <SelectItem value="企画">企画</SelectItem>
                        <SelectItem value="デザイン">デザイン</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>担当業務（詳細）*</Label>
                    <Textarea
                      value={work.responsibilities}
                      onChange={(e) => updateWorkHistory(work.id, 'responsibilities', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>実績・成果</Label>
                    <Textarea
                      value={work.achievements}
                      onChange={(e) => updateWorkHistory(work.id, 'achievements', e.target.value)}
                      rows={3}
                      placeholder="数値を含めて記載してください"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>使用ツール/スキル</Label>
                    <Input
                      value={work.skills}
                      onChange={(e) => updateWorkHistory(work.id, 'skills', e.target.value)}
                      placeholder="例: Excel, Python, Salesforce"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addWorkHistory} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              職歴を追加
            </Button>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                次へ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">スキル</h3>
              {skills.map((skill, index) => (
                <Card key={skill.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>スキル名</Label>
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                          placeholder="例: JavaScript"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>レベル</Label>
                        <Select
                          value={skill.level.toString()}
                          onValueChange={(value) => updateSkill(skill.id, 'level', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - 初級</SelectItem>
                            <SelectItem value="2">2 - 基礎</SelectItem>
                            <SelectItem value="3">3 - 中級</SelectItem>
                            <SelectItem value="4">4 - 上級</SelectItem>
                            <SelectItem value="5">5 - エキスパート</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>経験年数</Label>
                        <Input
                          type="number"
                          min="0"
                          value={skill.yearsOfExperience}
                          onChange={(e) => updateSkill(skill.id, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(skill.id)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addSkill} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                スキルを追加
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">資格</h3>
              {qualifications.map((qual, index) => (
                <Card key={qual.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>資格名</Label>
                        <Input
                          value={qual.name}
                          onChange={(e) => updateQualification(qual.id, 'name', e.target.value)}
                          placeholder="例: 基本情報技術者"
                        />
                      </div>
                      <div className="w-40 space-y-2">
                        <Label>取得年月</Label>
                        <Input
                          type="month"
                          value={qual.acquiredDate}
                          onChange={(e) => updateQualification(qual.id, 'acquiredDate', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQualification(qual.id)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addQualification} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                資格を追加
              </Button>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={() => setCurrentStep(5)}>
                次へ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>自己PR</Label>
              <Textarea
                value={selfPr}
                onChange={(e) => setSelfPr(e.target.value)}
                rows={8}
                placeholder="あなたの強みや経験、キャリアビジョンについて記載してください"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">希望条件（任意）</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>希望職種</Label>
                  <Input
                    value={desiredConditions.desiredJobType}
                    onChange={(e) => setDesiredConditions({ ...desiredConditions, desiredJobType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>希望勤務地</Label>
                  <Input
                    value={desiredConditions.desiredLocation}
                    onChange={(e) => setDesiredConditions({ ...desiredConditions, desiredLocation: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>希望年収</Label>
                  <Input
                    value={desiredConditions.desiredSalary}
                    onChange={(e) => setDesiredConditions({ ...desiredConditions, desiredSalary: e.target.value })}
                    placeholder="例: 600万円〜"
                  />
                </div>
                <div className="space-y-2">
                  <Label>入社可能時期</Label>
                  <Input
                    value={desiredConditions.availableDate}
                    onChange={(e) => setDesiredConditions({ ...desiredConditions, availableDate: e.target.value })}
                    placeholder="例: 即日、1ヶ月後"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={completeOnboarding} disabled={isLoading}>
                {isLoading ? '保存中...' : '完了してダッシュボードへ'}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">プロフィールを作成</h1>
          <p className="text-muted-foreground mt-2">
            基本情報を入力して、履歴書を完成させましょう
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-sm ${
                  currentStep >= step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            <CardDescription>
              {currentStep === 1 && '基本的な情報を入力してください'}
              {currentStep === 2 && '学歴を入力してください（複数追加可能）'}
              {currentStep === 3 && '職歴を入力してください（複数追加可能）'}
              {currentStep === 4 && 'スキルと資格を入力してください'}
              {currentStep === 5 && '自己PRと希望条件を入力してください'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={saveDraft} disabled={isLoading}>
            一時保存
          </Button>
        </div>
      </div>
    </div>
  )
}
