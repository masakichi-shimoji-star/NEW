import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { getSchoolTypeLabel, formatYearMonth } from '@/lib/utils'

export default async function ResumePreviewPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      educations: { orderBy: { enrollmentDate: 'desc' } },
      workHistories: { orderBy: { startDate: 'desc' } },
      qualifications: { orderBy: { acquiredDate: 'desc' } },
      skills: { orderBy: { level: 'desc' } },
      desiredCondition: true,
    },
  })

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/resume">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">履歴書プレビュー</h1>
          <p className="text-muted-foreground">印刷用の表示形式</p>
        </div>
      </div>

      <div className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex gap-6 mb-8">
          <Avatar className="h-32 w-32">
            <AvatarImage src={user.photo || undefined} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
            {user.nameKana && (
              <p className="text-muted-foreground mb-4">{user.nameKana}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">メール: </span>
                {user.email}
              </div>
              {user.phone && (
                <div>
                  <span className="text-muted-foreground">電話: </span>
                  {user.phone}
                </div>
              )}
              {user.address && (
                <div>
                  <span className="text-muted-foreground">居住地: </span>
                  {user.address}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Education */}
        {user.educations.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">学歴</h3>
            <div className="space-y-4">
              {user.educations.map((edu) => (
                <div key={edu.id} className="border-l-2 border-primary pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{edu.schoolName}</p>
                      <p className="text-sm text-muted-foreground">
                        {getSchoolTypeLabel(edu.schoolType)}
                        {edu.faculty && ` / ${edu.faculty}`}
                        {edu.department && ` ${edu.department}`}
                      </p>
                      {edu.major && (
                        <p className="text-sm text-muted-foreground">専攻: {edu.major}</p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatYearMonth(edu.enrollmentDate)} - {edu.isEnrolled ? '在学中' : edu.graduationDate ? formatYearMonth(edu.graduationDate) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work History */}
        {user.workHistories.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">職歴</h3>
            <div className="space-y-6">
              {user.workHistories.map((work) => (
                <div key={work.id} className="border-l-2 border-primary pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{work.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {work.department && `${work.department} / `}
                        {work.position || ''}
                        {work.employmentType && ` (${work.employmentType})`}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatYearMonth(work.startDate)} - {work.isCurrentJob ? '現在' : work.endDate ? formatYearMonth(work.endDate) : ''}
                    </p>
                  </div>
                  {work.responsibilities && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">担当業務</p>
                      <p className="text-sm whitespace-pre-wrap">{work.responsibilities}</p>
                    </div>
                  )}
                  {work.achievements && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">実績・成果</p>
                      <p className="text-sm whitespace-pre-wrap">{work.achievements}</p>
                    </div>
                  )}
                  {work.skills && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">使用スキル</p>
                      <p className="text-sm">{work.skills}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {user.skills.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">スキル</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name} (Lv.{skill.level})
                  {skill.yearsOfExperience && ` ${skill.yearsOfExperience}年`}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Qualifications */}
        {user.qualifications.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">資格</h3>
            <div className="space-y-2">
              {user.qualifications.map((qual) => (
                <div key={qual.id} className="flex justify-between">
                  <span>{qual.name}</span>
                  <span className="text-muted-foreground">{formatYearMonth(qual.acquiredDate)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Self PR */}
        {user.selfPr && (
          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">自己PR</h3>
            <p className="whitespace-pre-wrap">{user.selfPr}</p>
          </section>
        )}

        {/* Desired Conditions */}
        {user.desiredCondition && (
          <section>
            <h3 className="text-xl font-bold mb-4">希望条件</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {user.desiredCondition.desiredJobType && (
                <div>
                  <span className="text-muted-foreground">希望職種: </span>
                  {user.desiredCondition.desiredJobType}
                </div>
              )}
              {user.desiredCondition.desiredLocation && (
                <div>
                  <span className="text-muted-foreground">希望勤務地: </span>
                  {user.desiredCondition.desiredLocation}
                </div>
              )}
              {user.desiredCondition.desiredSalary && (
                <div>
                  <span className="text-muted-foreground">希望年収: </span>
                  {user.desiredCondition.desiredSalary}
                </div>
              )}
              {user.desiredCondition.availableDate && (
                <div>
                  <span className="text-muted-foreground">入社可能時期: </span>
                  {user.desiredCondition.availableDate}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
