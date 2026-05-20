import { IpaMain } from '@/features/IPA'
import { getIpaServer } from '@/features/IPA/services/serverApi'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    soundType?: string
    isActive?: string
    sortBy?: string
    sortOrder?: string
  }>
}

export default async function page({ searchParams }: PageProps) {
  const {
    page = '1',
    limit = '10',
    search = '',
    soundType,
    isActive,
    sortBy = 'orderIndex',
    sortOrder = 'asc'
  } = await searchParams

  const response = await getIpaServer({
    page: Number(page),
    limit: Number(limit),
    search,
    soundType: soundType as 'vowel' | 'consonant' | 'diphthong',
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    sortBy: sortBy as 'sound' | 'soundType' | 'createdAt' | 'updatedAt' | 'orderIndex',
    sortOrder: sortOrder as 'asc' | 'desc'
  })

  return (
    <IpaMain 
      initialData={response.data} 
      pagination={response.pagination} 
    />
  )
}
