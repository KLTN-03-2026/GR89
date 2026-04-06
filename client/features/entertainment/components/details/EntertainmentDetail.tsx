'use client'

import { useMemo, useState, useEffect } from 'react'
import { VideoLearningPlayer } from '@/components/common/medias'
import { getEntertainmentList, EntertainmentItem } from '../../services/entertainmentApi'
import { motion } from 'framer-motion'
import { EntertainmentHeader } from './EntertainmentHeader'
import { EntertainmentTabs } from './EntertainmentTabs'
import { EntertainmentSuggested } from './EntertainmentSuggested'
import { EntertainmentVipBanner } from './EntertainmentVipBanner'

type VideoSubtitleLine = {
  start: number
  end: number
  en: string
  vi: string
}

export interface EntertainmentDetailResponse {
  _id: string
  title: string
  description?: string
  author?: string
  type?: 'movie' | 'music' | 'podcast'
  videoUrl?: {
    url: string
    poster?: string
  }
  thumbnailUrl?: { url: string }
  videoSubtitleList?: VideoSubtitleLine[]
  createdAt?: string
}

interface EntertainmentDetailProps {
  detail: EntertainmentDetailResponse
}

export function EntertainmentDetail({ detail }: EntertainmentDetailProps) {
  const subtitles = useMemo(() => detail?.videoSubtitleList || [], [detail])
  const [relatedItems, setRelatedItems] = useState<EntertainmentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    if (detail.type) {
      setLoading(true)
      getEntertainmentList(detail.type)
        .then((res) => {
          if (res.success) {
            setRelatedItems(res.data.filter((item) => item._id !== detail._id))
          }
        })
        .finally(() => setLoading(false))
    }
  }, [detail.type, detail._id])

  const categoryLabel = useMemo(() => {
    const labels = {
      movie: { label: 'Phim & Video', color: 'bg-red-50 text-red-600 border-red-100' },
      music: { label: 'Âm nhạc', color: 'bg-purple-50 text-purple-600 border-purple-100' },
      podcast: { label: 'Podcast', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    }
    return labels[detail.type || 'movie']
  }, [detail.type])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-10"
    >
      <EntertainmentHeader detail={detail} categoryLabel={categoryLabel} />

      <VideoLearningPlayer
        src={detail.videoUrl?.url || ''}
        poster={detail.thumbnailUrl?.url || detail.videoUrl?.poster}
        subtitles={subtitles}
      />

      <EntertainmentTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        detail={detail}
        relatedItems={relatedItems}
      />

      <EntertainmentSuggested
        relatedItems={relatedItems}
        loading={loading}
        type={detail.type}
      />

      <EntertainmentVipBanner />
    </motion.div>
  )
}
