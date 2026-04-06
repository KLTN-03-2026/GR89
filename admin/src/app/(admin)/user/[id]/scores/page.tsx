import React from 'react'
import { UserDetailScoresMain } from '@/features/user'

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return (
    <div className="space-y-4">
      <UserDetailScoresMain userId={params.id} />
    </div>
  )
}
