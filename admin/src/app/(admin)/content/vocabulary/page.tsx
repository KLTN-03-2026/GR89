import { VocabularyTopicMain } from "@/features/vocabulary";
import { getVocabularyTopicsServer } from "@/features/vocabulary/services/serverApi";

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

  const response = await getVocabularyTopicsServer({
    page: Number(page),
    limit: Number(limit),
    search,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
  })

  return (
    <VocabularyTopicMain
      initialData={response.data}
      pagination={response.pagination}
    />
  );
}