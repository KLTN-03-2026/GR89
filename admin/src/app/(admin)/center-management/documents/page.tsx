import DocumentsMain from "@/features/center-management/documents";
import { getGlobalDocumentsServer } from "@/features/center-management/documents/services/serverApi";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function page({ searchParams }: PageProps) {
  const { page = "1", limit = "10", search = "", category = "" } = await searchParams;

  const response = await getGlobalDocumentsServer({
    page: Number(page),
    limit: Number(limit),
    search,
    category
  });

  return (
    <DocumentsMain
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
  );
}
