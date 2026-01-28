import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      photo: true,
      onboardingCompleted: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  )
}
