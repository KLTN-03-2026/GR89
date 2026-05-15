import React from 'react'
import { UserDetailScoresMain } from '@/features/user'

interface PageProps {
  params: Promise<{id: string}>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return (
    <div className="space-y-4">
      <UserDetailScoresMain userId={id} />
    </div>
  )
}
