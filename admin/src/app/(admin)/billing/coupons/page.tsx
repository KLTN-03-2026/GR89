import { CouponsMain } from "@/features/billing"
import { getCouponsServer } from "@/features/billing/services/serverApi"

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function CouponsPage({ searchParams }: PageProps) {
  const {
    page = "1",
    limit = "10",
    search = "",
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = await searchParams;

  const response = await getCouponsServer({
    page: Number(page),
    limit: Number(limit),
    search,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc'
  });

  return (
    <CouponsMain
      initialData={response?.data || []}
      pagination={response?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }}
    />
  )
}



















