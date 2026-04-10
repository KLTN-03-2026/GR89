'use client'

import { useMemo, useState, useEffect } from 'react'
import { VideoLearningPlayer } from '@/components/common/medias'
import {
  getEntertainmentList,
  EntertainmentItem,
  EntertainmentComment,
  toggleEntertainmentLike,
  getEntertainmentComments,
  createEntertainmentComment
} from '../../services/entertainmentApi'
import { motion } from 'framer-motion'
import { EntertainmentHeader } from './EntertainmentHeader'
import { EntertainmentTabs } from './EntertainmentTabs'
import { EntertainmentSuggested } from './EntertainmentSuggested'

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
  likesCount?: number
  commentsCount?: number
  userFlags?: {
    liked?: boolean
    watched?: boolean
  }
}

interface EntertainmentDetailProps {
  detail: EntertainmentDetailResponse
}

export function EntertainmentDetail({ detail }: EntertainmentDetailProps) {
  const subtitles = useMemo(() => detail?.videoSubtitleList || [], [detail])
  const [relatedItems, setRelatedItems] = useState<EntertainmentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [liked, setLiked] = useState(!!detail.userFlags?.liked)
  const [likesCount, setLikesCount] = useState(detail.likesCount || 0)
  const [comments, setComments] = useState<EntertainmentComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

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

  useEffect(() => {
    setLiked(!!detail.userFlags?.liked)
    setLikesCount(detail.likesCount || 0)
  }, [detail.userFlags?.liked, detail.likesCount])

  useEffect(() => {
    setLoadingComments(true)
    getEntertainmentComments(detail._id)
      .then((res) => {
        if (res.success) {
          setComments(res.data)
        }
      })
      .finally(() => setLoadingComments(false))
  }, [detail._id])

  const handleToggleLike = async () => {
    const response = await toggleEntertainmentLike(detail._id)
    if (response.success) {
      setLiked(response.data.liked)
      setLikesCount(response.data.likesCount)
    }
  }

  const handleCreateComment = async (content: string) => {
    setSubmittingComment(true)
    try {
      const response = await createEntertainmentComment(detail._id, content)
      if (response.success) {
        setComments((prev) => [response.data, ...prev])
      }
    } finally {
      setSubmittingComment(false)
    }
  }

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
      <EntertainmentHeader
        detail={detail}
        categoryLabel={categoryLabel}
        liked={liked}
        likesCount={likesCount}
        onToggleLike={handleToggleLike}
      />

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
        comments={comments}
        loadingComments={loadingComments}
        submittingComment={submittingComment}
        onCreateComment={handleCreateComment}
      />

      <EntertainmentSuggested
        relatedItems={relatedItems}
        loading={loading}
        type={detail.type}
      />

    </motion.div>
  )
}
