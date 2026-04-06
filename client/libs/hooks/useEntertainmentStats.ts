'use client'

import { useEffect, useState } from "react"
import {
  EntertainmentStatsEntry,
  EntertainmentType,
  getEntertainmentStatsForUser
} from '@/features/entertainment/services/entertainmentApi'

export function useEntertainmentStats(type: EntertainmentType) {
  const [stats, setStats] = useState<EntertainmentStatsEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await getEntertainmentStatsForUser()
        if (!mounted) return
        const entry = res.data?.find(item => item.type === type) || null
        setStats(entry)
      } catch (error) {
        console.error('Failed to load entertainment stats', error)
        if (mounted) setStats(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStats()
    return () => { mounted = false }
  }, [type])

  return { stats, loading }
}

