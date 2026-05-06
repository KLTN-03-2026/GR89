import { GrammarTopicMain } from '@/features/grammar'
import { getGrammarTopicsServer } from '@/features/grammar/services/serverApi'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    isActive?: string
  }>
}

export default async function page({ searchParams }: PageProps) {
  const {
    page = '1',
    limit = '10',
    search = '',
    sortBy = 'orderIndex',
    sortOrder = 'asc',
    isActive
  } = await searchParams

  const response = await getGrammarTopicsServer({
    page: Number(page),
    limit: Number(limit),
    search,
    sortBy: sortBy as 'orderIndex' | 'title' | 'createdAt' | 'updatedAt',
    sortOrder: sortOrder as 'asc' | 'desc',
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
  })

  return (
    <div>
      <GrammarTopicMain
        initialData={response.data}
        pagination={response.pagination}
      />
    </div>
  )
}
