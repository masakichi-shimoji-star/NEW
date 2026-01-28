import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatYearMonth(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  })
}

export function getRelationshipLabel(relationship: string): string {
  const labels: Record<string, string> = {
    SUPERVISOR: '上司',
    COLLEAGUE: '同僚',
    SUBORDINATE: '部下',
    CLIENT: '取引先',
    OTHER: 'その他',
  }
  return labels[relationship] || relationship
}

export function getSchoolTypeLabel(schoolType: string): string {
  const labels: Record<string, string> = {
    HIGH_SCHOOL: '高校',
    TECHNICAL_COLLEGE: '高専',
    VOCATIONAL_SCHOOL: '専門学校',
    JUNIOR_COLLEGE: '短大',
    UNIVERSITY: '大学',
    GRADUATE_SCHOOL: '大学院',
    OTHER: 'その他',
  }
  return labels[schoolType] || schoolType
}

export function getReviewerStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOT_SENT: '未送信',
    SENT: '送信済',
    IN_PROGRESS: '回答中',
    COMPLETED: '回答済',
  }
  return labels[status] || status
}

export function getReviewerStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NOT_SENT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
