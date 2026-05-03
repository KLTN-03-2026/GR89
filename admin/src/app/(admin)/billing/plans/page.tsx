import { PlansMain } from "@/features/billing"
import { getPlansServer } from "@/features/billing/services/serverApi"

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    isActive?: string;
    displayType?: string;
    billingCycle?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function PlansPage({ searchParams }: PageProps) {
  const { 
    page = "1", 
    limit = "10", 
    search = "", 
    isActive,
    displayType,
    billingCycle,
    sortBy = "sortOrder",
    sortOrder = "asc"
  } = await searchParams;

  const response = await getPlansServer({
    page: Number(page),
    limit: Number(limit),
    search,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    displayType: displayType as any,
    billingCycle: billingCycle as any,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc'
  });

  const formattedData = (response?.data || []).map((p: any) => ({ 
    ...p, 
    active: p.isActive 
  }));

  return (
    <PlansMain 
      initialData={formattedData} 
      pagination={response?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }}
    />
  )
}


