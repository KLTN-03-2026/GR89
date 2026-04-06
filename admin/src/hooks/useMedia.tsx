// src/hooks/useMedia.tsx (rút gọn)
'use client'
import { getMediaList, uploadImageSingle, uploadAudioSingle, uploadVideoSingle, MediaQueryParams } from "@/features/Media/services/api"
import { Media } from "@/features/Media/types"
import { useCallback, useState } from "react"
import { toast } from "react-toastify"

export default function useMedia() {
  const [images, setImages] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })

  const getMedias = useCallback(async (params?: MediaQueryParams) => {
    setLoading(true)
    try {
      const res = await getMediaList({ limit: 12, ...params })
      setImages(res.data as Media[])
      if (res.pagination) {
        setPagination({
          page: res.pagination.page,
          limit: res.pagination.limit,
          total: res.pagination.total,
          pages: res.pagination.pages,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMoreMedias = useCallback(async (params?: MediaQueryParams) => {
    setLoading(true)
    try {
      const nextPage = pagination.page + 1
      const res = await getMediaList({ ...params, page: nextPage, limit: pagination.limit })
      if (res.data && res.data.length > 0) {
        setImages((prev) => [...prev, ...(res.data as Media[])])
        if (res.pagination) {
          setPagination({
            page: res.pagination.page,
            limit: res.pagination.limit,
            total: res.pagination.total,
            pages: res.pagination.pages,
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const uploadImage = useCallback(async (file: File) => {
    setLoading(true)
    try {
      const res = await uploadImageSingle(file)
      toast.success('Tải lên thành công')
      return res.data
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadAudio = useCallback(async (file: File) => {
    setLoading(true)
    try {
      const res = await uploadAudioSingle(file)
      toast.success('Tải lên audio thành công')
      return res.data
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadVideo = useCallback(async (file: File) => {
    setLoading(true)
    try {
      const res = await uploadVideoSingle(file)
      toast.success('Tải lên video thành công')
      return res.data
    } finally {
      setLoading(false)
    }
  }, [])

  return { images, loading, pagination, getMedias, loadMoreMedias, uploadImage, uploadAudio, uploadVideo, setImages, setPagination }
}