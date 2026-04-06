import { useState, useEffect, useMemo } from 'react'
import { getActivePlans, type Plan } from '@/features/upgrade/services/upgradeApi'
import { toast } from 'react-toastify'

export function usePlans(autoFetch: boolean = true) {
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const res = await getActivePlans()
      setPlans(res.data)
    } catch (error) {
      toast.error('Không thể tải danh sách gói dịch vụ')
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchPlans()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch])

  const sortedPlans = useMemo(
    () => plans ? [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [],
    [plans]
  )

  return {
    plans,
    sortedPlans,
    isLoading,
    refetch: fetchPlans
  }
}

