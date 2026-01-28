import { User, Education, WorkHistory, Qualification, Skill, DesiredCondition, Reviewer, Evaluation, PublicUrl } from '@prisma/client'

// Extended types with relations
export type UserWithRelations = User & {
  educations: Education[]
  workHistories: WorkHistory[]
  qualifications: Qualification[]
  skills: Skill[]
  desiredCondition: DesiredCondition | null
}

export type ReviewerWithEvaluation = Reviewer & {
  evaluation: Evaluation | null
}

export type ReviewerWithCandidate = Reviewer & {
  candidate: User
}

export type EvaluationWithReviewer = Evaluation & {
  reviewer: Reviewer
}

export type PublicUrlWithCandidate = PublicUrl & {
  candidate: UserWithRelations & {
    reviewers: ReviewerWithEvaluation[]
  }
}

// Form types
export type ProfileFormData = {
  name: string
  nameKana?: string
  phone?: string
  address?: string
  selfPr?: string
}

export type EducationFormData = {
  schoolType: string
  schoolName: string
  faculty?: string
  department?: string
  enrollmentDate: string
  graduationDate?: string
  isEnrolled: boolean
  major?: string
}

export type WorkHistoryFormData = {
  companyName: string
  department?: string
  employmentType: string
  startDate: string
  endDate?: string
  isCurrentJob: boolean
  position?: string
  jobCategory?: string
  responsibilities: string
  achievements?: string
  skills?: string
}

export type QualificationFormData = {
  name: string
  acquiredDate: string
}

export type SkillFormData = {
  name: string
  level: number
  yearsOfExperience?: number
}

export type DesiredConditionFormData = {
  desiredJobType?: string
  desiredLocation?: string
  desiredSalary?: string
  availableDate?: string
}

export type ReviewerFormData = {
  name: string
  email: string
  company: string
  department?: string
  position?: string
  relationship: string
  workPeriodStart: string
  workPeriodEnd?: string
  isCurrentlyWorking: boolean
  memo?: string
}

// Evaluation form types
export type NumericalEvaluation = {
  expertise: number // 専門知識・スキル
  expertiseComment?: string
  problemSolving: number // 問題解決能力
  problemSolvingComment?: string
  communication: number // コミュニケーション能力
  communicationComment?: string
  teamwork: number // チームワーク・協調性
  teamworkComment?: string
  leadership: number // リーダーシップ
  leadershipComment?: string
  initiative: number // 主体性・積極性
  initiativeComment?: string
  responsibility: number // 責任感
  responsibilityComment?: string
  timeManagement: number // 時間管理・締切遵守
  timeManagementComment?: string
  creativity: number // 創造性・革新性
  creativityComment?: string
  stressResistance: number // ストレス耐性
  stressResistanceComment?: string
}

export type Episode = {
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

export type EvaluationFormData = {
  // 総合結論
  overallScore: number
  recommendationScore: number
  wouldWorkAgain: boolean
  wouldWorkAgainReason: string
  // 数値評価
  numericalEvaluations: NumericalEvaluation
  // エピソード
  episode1: Episode
  episode2: Episode
  episode3?: Episode
  // 横断評価
  strengthTop: string
  strengthEvidence: string
  riskTop: string
  riskConditions: string
  riskSigns: string
  riskMitigation: string
  suitableEnvironment: string
  managementTips: string
  // 総合人物像
  overallPersonality: string
  // 最終チェック
  factBased: boolean
  confidentialityConsidered: boolean
  noDefamation: boolean
}

// Auth types
declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    onboardingCompleted: boolean
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    onboardingCompleted: boolean
  }
}
