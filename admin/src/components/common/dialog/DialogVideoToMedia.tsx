'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { VideoIcon, Play, Check, Calendar, FileText, Loader2, Plus } from 'lucide-react'
import useMedia from '@/hooks/useMedia'
import { DialogAddVideo } from '../../../features/Media/components/dialog/MediaVideo'
import { useEffect, useState } from 'react'
import { Media } from "@/features/Media/types";
import Image from 'next/image'
import type { ReactNode } from 'react'

interface DialogVideoToMediaProps {
  onSelect: (video: Media) => void
  children?: ReactNode
}

export function DialogVideoToMedia({ onSelect, children }: DialogVideoToMediaProps) {
  const [selectedVideo, setSelectedVideo] = useState<Media | null>(null)
  const { images, getMedias, loadMoreMedias, loading, pagination } = useMedia()

  useEffect(() => {
    getMedias({ type: 'video' })
  }, [getMedias])

  const handleSelect = () => {
    if (selectedVideo) onSelect(selectedVideo)
    setSelectedVideo(null)
  }

  const handleLoadMore = () => {
    loadMoreMedias({ type: 'video' })
  }

  // Check if it's a YouTube video
  const isYouTube = (video: Media) => video.url.includes('youtube.com') || video.url.includes('youtu.be') || video.format === 'youtube'
  const getYoutubeVideoId = (video: Media) => {
    if (video.url.includes('youtu.be/')) {
      return video.url.split('youtu.be/')[1].split('?')[0]
    } else if (video.url.includes('youtube.com/watch?v=')) {
      return video.url.split('v=')[1].split('&')[0]
    }
    return null
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full" variant="outline">
            <VideoIcon className="w-4 h-4" />
            Chọn video từ thư viện
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[1000px] !max-w-[95vw] flex flex-col max-h-[80vh] ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><VideoIcon />Chọn video từ thư viện</DialogTitle>
          <DialogDescription>Chọn video từ thư viện media</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto min-h-[50%] grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 flex-1 p-2">
          {/* Card upload/thêm video mới */}
          <DialogAddVideo onLoad={getMedias} />

          {images.filter((image) => image.type === 'video' || image.format === 'youtube').map((video) => {
            const isYoutube = isYouTube(video)
            const youtubeVideoId = isYoutube ? getYoutubeVideoId(video) : null

            return (
              <Card
                key={video._id}
                className={`shadow-sm hover:shadow-md transition-all cursor-pointer group ${selectedVideo?._id === video._id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                onClick={() => setSelectedVideo(video)}
              >
                <CardContent className="p-2">
                  {/* Video Thumbnail */}
                  <div className="relative group mb-4">
                    {isYoutube ? (
                      // YouTube thumbnail
                      <div className="w-full rounded overflow-hidden relative aspect-video">
                        <Image
                          src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover"
                          width={300}
                          height={160}
                        />
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                          </div>
                        </div>
                        {/* YouTube Badge */}
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          YOUTUBE
                        </div>
                      </div>
                    ) : (
                      // Regular video element
                      <div className="relative">
                        <video
                          preload="metadata"
                          className="w-full h-40 object-cover rounded"
                          muted
                        >
                          <source src={video.url} />
                          Trình duyệt của bạn không hỗ trợ video.
                        </video>
                        {/* Video Badge */}
                        <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                          {video.format?.toUpperCase() || 'VIDEO'}
                        </div>
                        {/* Duration for regular videos */}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selectedVideo?._id === video._id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="space-y-3">
                    {/* Title/Type */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white">
                        <VideoIcon className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {isYoutube ? 'YouTube Video' : (video.format?.toUpperCase() || 'VIDEO')} File
                        </div>
                        <div className="text-xs text-gray-500">
                          {isYoutube ? 'Video từ YouTube' : 'Video tải lên'}
                        </div>
                      </div>
                    </div>

                    {/* File Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        <span>Kích thước: {isYoutube ? 'N/A' : (video.size ? formatFileSize(video.size) : 'N/A')}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>Tạo: {new Date(video.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className='text-xs text-gray-500'>
                      ID: {video._id}
                    </div>

                    {/* User info */}
                    {video.userId && (
                      <div className="text-xs text-gray-500 border-t pt-2">
                        <span className="font-medium">Người tạo:</span> {video.userId.fullName || video.userId.email}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {pagination.page < pagination.pages && (
            <div className="col-span-full flex justify-center py-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tải thêm video
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          {selectedVideo && (
            <div className="border-t pt-4 mt-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {isYouTube(selectedVideo) ? (
                    <Image
                      src={`https://img.youtube.com/vi/${getYoutubeVideoId(selectedVideo)}/maxresdefault.jpg`}
                      alt="YouTube thumbnail"
                      className="w-24 h-16 object-cover rounded"
                      width={96}
                      height={64}
                    />
                  ) : (
                    <video src={selectedVideo.url} className="w-24 h-16 object-cover rounded" muted />
                  )}
                  <div>
                    <p className="font-medium">Video đã chọn</p>
                    <p className="text-sm text-gray-600">
                      {isYouTube(selectedVideo) ? 'YOUTUBE' : (selectedVideo.format?.toUpperCase() || 'VIDEO')}
                    </p>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button onClick={handleSelect} className="bg-blue-500 hover:bg-blue-600">
                    <Check className="w-4 h-4 mr-2" />
                    Sử dụng video này
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}