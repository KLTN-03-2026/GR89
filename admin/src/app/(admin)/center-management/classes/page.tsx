import { ClassesMain } from "@/features/center-management/classes";
import { getCenterClassesServer } from "@/features/center-management/classes/services/serverApi";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function page({ searchParams }: PageProps) {
  const {
    page = "1",
    limit = "10",
    search = "",
    category,
    status,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = await searchParams;

  const response = await getCenterClassesServer({
    page: Number(page),
    limit: Number(limit),
    search,
    category,
    status,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc'
  });
  return (
    <ClassesMain 
      initialData={response?.data || []}
      pagination={response?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      }}
    />
  )
}
