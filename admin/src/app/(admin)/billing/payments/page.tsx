import { PaymentsMain } from "@/features/billing"
import { getPaymentsServer } from "@/features/billing/services/serverApi"

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    provider?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const { 
    page = "1", 
    limit = "10", 
    search = "", 
    status,
    provider,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = await searchParams;

  const response = await getPaymentsServer({
    page: Number(page),
    limit: Number(limit),
    search,
    status: status as any,
    provider: provider as any,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc'
  });

  const formattedData = (response?.data || []).map((p: any) => ({
    ...p,
    id: p._id,
    user: typeof p.userId === 'object' ? p.userId.fullName : String(p.userId)
  }));

  return (
    <PaymentsMain 
      initialData={formattedData} 
      pagination={response?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }}
      initialPaidCount={response?.paidCount || 0}
      initialTotalRevenue={response?.totalRevenue || 0}
    />
  )
}


