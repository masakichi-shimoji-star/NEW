'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { ChevronLeft, ChevronRight, Save, Send, Star } from 'lucide-react'

const steps = [
  { id: 1, name: 'プロフィール' },
  { id: 2, name: '総合結論' },
  { id: 3, name: '数値評価' },
  { id: 4, name: 'エピソード1' },
  { id: 5, name: 'エピソード2' },
  { id: 6, name: 'エピソード3' },
  { id: 7, name: '横断評価' },
  { id: 8, name: '総合人物像' },
  { id: 9, name: '最終確認' },
]

const numericalCategories = [
  { key: 'expertise', label: '専門知識・スキル' },
  { key: 'problemSolving', label: '問題解決能力' },
  { key: 'communication', label: 'コミュニケーション能力' },
  { key: 'teamwork', label: 'チームワーク・協調性' },
  { key: 'leadership', label: 'リーダーシップ' },
  { key: 'initiative', label: '主体性・積極性' },
  { key: 'responsibility', label: '責任感' },
  { key: 'timeManagement', label: '時間管理・締切遵守' },
  { key: 'creativity', label: '創造性・革新性' },
  { key: 'stressResistance', label: 'ストレス耐性' },
]

interface ReviewerProfile {
  name: string
  email: string
  company: string
  department: string
  position: string
  relationship: string
  workPeriodStart: string
  workPeriodEnd: string
  isCurrentlyWorking: boolean
}

interface Episode {
  title: string
  period: string
  background: string
  role: string
  actions: string
  results: string
  abilities: string
  challenges: string
  learnings: string
}

const emptyEpisode: Episode = {
  title: '',
  period: '',
  background: '',
  role: '',
  actions: '',
  results: '',
  abilities: '',
  challenges: '',
  learnings: '',
}

export default function ReviewFormPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [candidateName, setCandidateName] = useState('')

  // Profile
  const [profile, setProfile] = useState<ReviewerProfile>({
    name: '',
    email: '',
    company: '',
    department: '',
    position: '',
    relationship: '',
    workPeriodStart: '',
    workPeriodEnd: '',
    isCurrentlyWorking: false,
  })

  // Overall conclusion
  const [overallScore, setOverallScore] = useState(70)
  const [recommendationScore, setRecommendationScore] = useState(7)
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null)
  const [wouldWorkAgainReason, setWouldWorkAgainReason] = useState('')

  // Numerical evaluations
  const [numericalEvaluations, setNumericalEvaluations] = useState<Record<string, number | string>>({})

  // Episodes
  const [episode1, setEpisode1] = useState<Episode>(emptyEpisode)
  const [episode2, setEpisode2] = useState<Episode>(emptyEpisode)
  const [episode3, setEpisode3] = useState<Episode>(emptyEpisode)
  const [hasEpisode3, setHasEpisode3] = useState(false)

  // Cross-sectional evaluation
  const [strengthTop, setStrengthTop] = useState('')
  const [strengthEvidence, setStrengthEvidence] = useState('')
  const [riskTop, setRiskTop] = useState('')
  const [riskConditions, setRiskConditions] = useState('')
  const [riskSigns, setRiskSigns] = useState('')
  const [riskMitigation, setRiskMitigation] = useState('')
  const [suitableEnvironment, setSuitableEnvironment] = useState('')
  const [managementTips, setManagementTips] = useState('')

  // Overall personality
  const [overallPersonality, setOverallPersonality] = useState('')

  // Final checks
  const [factBased, setFactBased] = useState(false)
  const [confidentialityConsidered, setConfidentialityConsidered] = useState(false)
  const [noDefamation, setNoDefamation] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch(`/api/review/${params.token}`)
      if (!response.ok) {
        router.push(`/review/${params.token}`)
        return
      }
      const data = await response.json()
      setCandidateName(data.candidate.name)

      // Pre-fill profile from reviewer data
      setProfile({
        name: data.name || '',
        email: data.email || '',
        company: data.company || '',
        department: data.department || '',
        position: data.position || '',
        relationship: data.relationship || '',
        workPeriodStart: data.workPeriodStart ? new Date(data.workPeriodStart).toISOString().slice(0, 7) : '',
        workPeriodEnd: data.workPeriodEnd ? new Date(data.workPeriodEnd).toISOString().slice(0, 7) : '',
        isCurrentlyWorking: data.isCurrentlyWorking || false,
      })

      // Load existing evaluation if any
      if (data.evaluation) {
        const eval_ = data.evaluation
        setOverallScore(eval_.overallScore || 70)
        setRecommendationScore(eval_.recommendationScore || 7)
        setWouldWorkAgain(eval_.wouldWorkAgain)
        setWouldWorkAgainReason(eval_.wouldWorkAgainReason || '')

        if (eval_.numericalEvaluations) {
          setNumericalEvaluations(JSON.parse(eval_.numericalEvaluations))
        }
        if (eval_.episode1) setEpisode1(JSON.parse(eval_.episode1))
        if (eval_.episode2) setEpisode2(JSON.parse(eval_.episode2))
        if (eval_.episode3) {
          setEpisode3(JSON.parse(eval_.episode3))
          setHasEpisode3(true)
        }

        setStrengthTop(eval_.strengthTop || '')
        setStrengthEvidence(eval_.strengthEvidence || '')
        setRiskTop(eval_.riskTop || '')
        setRiskConditions(eval_.riskConditions || '')
        setRiskSigns(eval_.riskSigns || '')
        setRiskMitigation(eval_.riskMitigation || '')
        setSuitableEnvironment(eval_.suitableEnvironment || '')
        setManagementTips(eval_.managementTips || '')
        setOverallPersonality(eval_.overallPersonality || '')
        setFactBased(eval_.factBased || false)
        setConfidentialityConsidered(eval_.confidentialityConsidered || false)
        setNoDefamation(eval_.noDefamation || false)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFormData = () => ({
    profile,
    overallScore,
    recommendationScore,
    wouldWorkAgain,
    wouldWorkAgainReason,
    numericalEvaluations: JSON.stringify(numericalEvaluations),
    episode1: JSON.stringify(episode1),
    episode2: JSON.stringify(episode2),
    episode3: hasEpisode3 ? JSON.stringify(episode3) : null,
    strengthTop,
    strengthEvidence,
    riskTop,
    riskConditions,
    riskSigns,
    riskMitigation,
    suitableEnvironment,
    managementTips,
    overallPersonality,
    factBased,
    confidentialityConsidered,
    noDefamation,
  })

  const saveDraft = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/review/${params.token}/evaluation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...getFormData(), isDraft: true }),
      })
      if (response.ok) {
        toast({ title: '保存しました', description: '入力内容を一時保存しました' })
      }
    } catch (error) {
      toast({ title: 'エラー', description: '保存に失敗しました', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const submit = async () => {
    if (!factBased || !confidentialityConsidered || !noDefamation) {
      toast({ title: 'エラー', description: '最終チェック項目をすべて確認してください', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/review/${params.token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormData()),
      })
      if (response.ok) {
        router.push(`/review/${params.token}/complete`)
      }
    } catch (error) {
      toast({ title: 'エラー', description: '送信に失敗しました', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderNumericalRating = (key: string, label: string) => (
    <div key={key} className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNumericalEvaluations({ ...numericalEvaluations, [key]: star })}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (numericalEvaluations[key] as number || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <Input
        placeholder="補足コメント（任意）"
        value={numericalEvaluations[`${key}Comment`] as string || ''}
        onChange={(e) => setNumericalEvaluations({ ...numericalEvaluations, [`${key}Comment`]: e.target.value })}
      />
    </div>
  )

  const renderEpisodeForm = (episode: Episode, setEpisode: (e: Episode) => void, number: number) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>エピソードタイトル *</Label>
        <Input
          value={episode.title}
          onChange={(e) => setEpisode({ ...episode, title: e.target.value })}
          placeholder="例: 新規サービスの立ち上げ"
        />
      </div>
      <div className="space-y-2">
        <Label>期間</Label>
        <Input
          value={episode.period}
          onChange={(e) => setEpisode({ ...episode, period: e.target.value })}
          placeholder="例: 2022年4月〜2023年3月"
        />
      </div>
      <div className="space-y-2">
        <Label>目的・背景 *</Label>
        <Textarea
          value={episode.background}
          onChange={(e) => setEpisode({ ...episode, background: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>候補者の役割 *</Label>
        <Textarea
          value={episode.role}
          onChange={(e) => setEpisode({ ...episode, role: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>具体的な行動（時系列）*</Label>
        <Textarea
          value={episode.actions}
          onChange={(e) => setEpisode({ ...episode, actions: e.target.value })}
          rows={5}
        />
      </div>
      <div className="space-y-2">
        <Label>成果・結果 *</Label>
        <Textarea
          value={episode.results}
          onChange={(e) => setEpisode({ ...episode, results: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>発揮された能力・特性</Label>
        <Textarea
          value={episode.abilities}
          onChange={(e) => setEpisode({ ...episode, abilities: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>課題や困難への対応</Label>
        <Textarea
          value={episode.challenges}
          onChange={(e) => setEpisode({ ...episode, challenges: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>学びや成長</Label>
        <Textarea
          value={episode.learnings}
          onChange={(e) => setEpisode({ ...episode, learnings: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              評価者としてのあなたの情報を確認・入力してください
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>氏名 *</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>メールアドレス *</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>会社名 *</Label>
                <Input
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>所属部署</Label>
                <Input
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="なしの場合は空欄"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>役職</Label>
                <Input
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  placeholder="なしの場合は空欄"
                />
              </div>
              <div className="space-y-2">
                <Label>候補者との関係性 *</Label>
                <Select
                  value={profile.relationship}
                  onValueChange={(value) => setProfile({ ...profile, relationship: value })}
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>一緒に働いた期間（開始）*</Label>
                <Input
                  type="month"
                  value={profile.workPeriodStart}
                  onChange={(e) => setProfile({ ...profile, workPeriodStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>一緒に働いた期間（終了）</Label>
                <Input
                  type="month"
                  value={profile.workPeriodEnd}
                  onChange={(e) => setProfile({ ...profile, workPeriodEnd: e.target.value })}
                  disabled={profile.isCurrentlyWorking}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCurrentlyWorking"
                checked={profile.isCurrentlyWorking}
                onCheckedChange={(checked) => setProfile({ ...profile, isCurrentlyWorking: checked === true })}
              />
              <Label htmlFor="isCurrentlyWorking">現在も一緒に働いている</Label>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>総合評価（0-100）*</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={overallScore}
                  onChange={(e) => setOverallScore(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-16 text-center">{overallScore}</span>
              </div>
            </div>
            <div className="space-y-4">
              <Label>推薦度（0-10）*</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="0"
                  max="10"
                  value={recommendationScore}
                  onChange={(e) => setRecommendationScore(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-16 text-center">{recommendationScore}</span>
              </div>
            </div>
            <div className="space-y-4">
              <Label>再び一緒に働きたいですか？ *</Label>
              <RadioGroup
                value={wouldWorkAgain === null ? '' : wouldWorkAgain ? 'yes' : 'no'}
                onValueChange={(value) => setWouldWorkAgain(value === 'yes')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">いいえ</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>理由 *</Label>
              <Textarea
                value={wouldWorkAgainReason}
                onChange={(e) => setWouldWorkAgainReason(e.target.value)}
                rows={5}
                placeholder="上記の判断に至った理由を詳しく記載してください"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              各項目について5段階で評価してください
            </p>
            {numericalCategories.map(({ key, label }) => renderNumericalRating(key, label))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {candidateName}さんの仕事ぶりを示す具体的なエピソードを記載してください（必須）
            </p>
            {renderEpisodeForm(episode1, setEpisode1, 1)}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              2つ目のエピソードを記載してください（必須）
            </p>
            {renderEpisodeForm(episode2, setEpisode2, 2)}
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="hasEpisode3"
                checked={hasEpisode3}
                onCheckedChange={(checked) => setHasEpisode3(checked === true)}
              />
              <Label htmlFor="hasEpisode3">3つ目のエピソードを追加する（任意）</Label>
            </div>
            {hasEpisode3 && renderEpisodeForm(episode3, setEpisode3, 3)}
            {!hasEpisode3 && (
              <p className="text-muted-foreground text-center py-8">
                3つ目のエピソードは任意です。追加する場合は上のチェックボックスをオンにしてください。
              </p>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>強みTop *</Label>
              <Textarea
                value={strengthTop}
                onChange={(e) => setStrengthTop(e.target.value)}
                rows={3}
                placeholder="候補者の最も優れた強みを記載してください"
              />
            </div>
            <div className="space-y-2">
              <Label>強みの根拠</Label>
              <Textarea
                value={strengthEvidence}
                onChange={(e) => setStrengthEvidence(e.target.value)}
                rows={3}
                placeholder="上記の強みを示す具体的な根拠"
              />
            </div>
            <div className="space-y-2">
              <Label>リスクTop *</Label>
              <Textarea
                value={riskTop}
                onChange={(e) => setRiskTop(e.target.value)}
                rows={3}
                placeholder="候補者の最も注意すべきリスク"
              />
            </div>
            <div className="space-y-2">
              <Label>発生条件</Label>
              <Textarea
                value={riskConditions}
                onChange={(e) => setRiskConditions(e.target.value)}
                rows={2}
                placeholder="どのような条件でリスクが発生しやすいか"
              />
            </div>
            <div className="space-y-2">
              <Label>兆候</Label>
              <Textarea
                value={riskSigns}
                onChange={(e) => setRiskSigns(e.target.value)}
                rows={2}
                placeholder="リスクが顕在化する前の兆候"
              />
            </div>
            <div className="space-y-2">
              <Label>対処法</Label>
              <Textarea
                value={riskMitigation}
                onChange={(e) => setRiskMitigation(e.target.value)}
                rows={2}
                placeholder="リスクへの対処方法"
              />
            </div>
            <div className="space-y-2">
              <Label>向いている環境・役割 *</Label>
              <Textarea
                value={suitableEnvironment}
                onChange={(e) => setSuitableEnvironment(e.target.value)}
                rows={3}
                placeholder="候補者が活躍できる環境や役割"
              />
            </div>
            <div className="space-y-2">
              <Label>マネジメント/育成のコツ *</Label>
              <Textarea
                value={managementTips}
                onChange={(e) => setManagementTips(e.target.value)}
                rows={3}
                placeholder="候補者を上手くマネジメントするためのコツ"
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {candidateName}さんの人物像を総合的に記述してください
            </p>
            <div className="space-y-2">
              <Label>総合人物像 *</Label>
              <Textarea
                value={overallPersonality}
                onChange={(e) => setOverallPersonality(e.target.value)}
                rows={10}
                placeholder="候補者の人物像、仕事への姿勢、チームでの役割、成長可能性などを総合的に記述してください"
              />
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              以下の項目を確認し、すべてチェックしてから送信してください
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="factBased"
                  checked={factBased}
                  onCheckedChange={(checked) => setFactBased(checked === true)}
                />
                <div>
                  <Label htmlFor="factBased" className="font-medium">事実ベース</Label>
                  <p className="text-sm text-muted-foreground">
                    この評価は、実際に経験・観察した事実に基づいて記載しました
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confidentialityConsidered"
                  checked={confidentialityConsidered}
                  onCheckedChange={(checked) => setConfidentialityConsidered(checked === true)}
                />
                <div>
                  <Label htmlFor="confidentialityConsidered" className="font-medium">守秘義務配慮</Label>
                  <p className="text-sm text-muted-foreground">
                    機密情報や個人情報に配慮し、守秘義務に反する内容は記載していません
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="noDefamation"
                  checked={noDefamation}
                  onCheckedChange={(checked) => setNoDefamation(checked === true)}
                />
                <div>
                  <Label htmlFor="noDefamation" className="font-medium">誹謗中傷なし</Label>
                  <p className="text-sm text-muted-foreground">
                    この評価には誹謗中傷や根拠のない批判は含まれていません
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{candidateName}さんの評価</h1>
          <p className="text-muted-foreground">
            ステップ {currentStep} / {steps.length}: {steps[currentStep - 1].name}
          </p>
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveDraft} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  一時保存
                </Button>
                {currentStep < steps.length ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    次へ
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={isSaving || !factBased || !confidentialityConsidered || !noDefamation}>
                    <Send className="mr-2 h-4 w-4" />
                    送信
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
