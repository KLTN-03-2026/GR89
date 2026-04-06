'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, ExternalLink, Video, Trash2, Hash, Play, Subtitles } from 'lucide-react'
import { deleteMedia } from '@/features/Media/services/api'
import { Media } from '@/features/Media/types';
import { DialogSubtitleManager } from '@/features/Media/components/dialog/MediaVideo/DialogSubtitleManager'

interface VideoCardProps {
  item: Media
  onLoading: (isLoading: boolean) => void
  onMeta: (duration?: number) => void
}

export default function VideoCard({ item, onLoading, onMeta }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showSubtitleDialog, setShowSubtitleDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mediaData, setMediaData] = useState<Media>(item)

  useEffect(() => {
    setMediaData(item)
  }, [item])

  const isYouTube = mediaData.url.includes('youtube.com') || mediaData.url.includes('youtu.be')
  const isVimeo = mediaData.url.includes('vimeo.com')
  const youtubeVideoId = isYouTube ? (() => {
    if (mediaData.url.includes('youtu.be/')) {
      return mediaData.url.split('youtu.be/')[1].split('?')[0]
    }
    if (mediaData.url.includes('youtube.com/watch?v=')) {
      return mediaData.url.split('v=')[1].split('&')[0]
    }
    if (mediaData.url.includes('youtube.com/embed/')) {
      return mediaData.url.split('embed/')[1].split('?')[0]
    }
    return null
  })() : null
  const vimeoVideoId = isVimeo ? (() => {
    const regex = /vimeo\.com\/(?:video\/|channels\/[\w]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/|)(\d+)/
    const match = mediaData.url.match(regex)
    return match && match[1] ? match[1] : null
  })() : null
  const hasSubtitle = Boolean(mediaData.subtitles && mediaData.subtitles.length > 0)

  useEffect(() => {
    if (isYouTube || isVimeo) return
    const el = videoRef.current
    if (!el) return
    const handleLoadStart = () => onLoading(true)
    const handleLoaded = () => onMeta(el.duration)
    const handleError = () => onMeta(undefined)
    el.addEventListener('loadstart', handleLoadStart)
    el.addEventListener('loadedmetadata', handleLoaded)
    el.addEventListener('error', handleError)
    return () => {
      el.removeEventListener('loadstart', handleLoadStart)
      el.removeEventListener('loadedmetadata', handleLoaded)
      el.removeEventListener('error', handleError)
    }
  }, [mediaData.url, onLoading, onMeta, isYouTube, isVimeo])

  const copyToClipboard = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(message)
    } catch {
      toast.error('Không thể sao chép')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMedia(mediaData._id)
      toast.success('Đã xóa video')
    } catch {
      toast.error('Không thể xóa video')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="flex h-full min-h-[400px] flex-col overflow-hidden shadow-sm transition hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500 text-white">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isYouTube ? 'YOUTUBE' : isVimeo ? 'VIMEO' : (mediaData.format?.toUpperCase() || 'VIDEO')} File
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  {isYouTube ? 'YouTube Video' : isVimeo ? 'Vimeo Video' : (mediaData.size ? `${Math.round(mediaData.size / 1024)}KB` : '')}
                  {hasSubtitle && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Subtitle
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Thumbnail */}
          <div className="group relative mb-4 cursor-pointer" onClick={() => setShowPreviewDialog(true)}>
            {isYouTube ? (
              <div className="relative h-48 w-full overflow-hidden rounded">
                <Image
                  src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                  alt="YouTube thumbnail"
                  className="h-full w-full object-cover"
                  width={mediaData.width || 320}
                  height={mediaData.height || 180}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded bg-black/20 transition group-hover:bg-black/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="ml-1 h-6 w-6 text-gray-800" fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : isVimeo ? (
              <div className="relative h-48 w-full overflow-hidden rounded">
                <Image
                  src={vimeoVideoId ? `https://vumbnail.com/${vimeoVideoId}.jpg` : '/images/video-placeholder.jpg'}
                  alt="Vimeo thumbnail"
                  className="h-full w-full object-cover"
                  width={mediaData.width || 320}
                  height={mediaData.height || 180}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded bg-black/20 transition group-hover:bg-black/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="ml-1 h-6 w-6 text-gray-800" fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  preload="metadata"
                  className="h-48 w-full rounded object-cover"
                  muted
                >
                  <source src={mediaData.url} />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
                <div className="absolute inset-0 flex items-center justify-center rounded bg-black/20 transition group-hover:bg-black/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="ml-1 h-6 w-6 text-gray-800" fill="currentColor" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(mediaData.url, 'Đã sao chép liên kết')} className="text-xs">
              <Copy className="mr-1 h-3 w-3" />
              Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(mediaData._id, 'Đã sao chép ID')} className="text-xs">
              <Hash className="mr-1 h-3 w-3" />
              ID
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(mediaData.url, '_blank')} className="text-xs">
              <ExternalLink className="mr-1 h-3 w-3" />
              Mở
            </Button>
            <Button
              variant={hasSubtitle ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowSubtitleDialog(true)}
              className="text-xs flex items-center justify-center gap-1"
            >
              <Subtitles className="h-3 w-3" />
              Subtitle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="w-[95vw] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Xem Video</DialogTitle>
          </DialogHeader>
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-[500px] w-full rounded-lg"
            />
          ) : isVimeo ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1`}
              title="Vimeo video player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-[500px] w-full rounded-lg"
            />
          ) : (
            <video controls autoPlay className="h-auto w-full rounded-lg">
              <source src={mediaData.url} />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Định dạng:</span> {isYouTube ? 'YOUTUBE' : isVimeo ? 'VIMEO' : (mediaData.format?.toUpperCase() || 'VIDEO')}
            </div>
            <div>
              <span className="font-medium">Kích thước:</span> {isYouTube ? 'N/A' : (mediaData.size ? `${Math.round(mediaData.size / 1024)}KB` : 'N/A')}
            </div>
            <div>
              <span className="font-medium">ID:</span> {mediaData._id}
            </div>
            <div>
              <span className="font-medium">Ngày tạo:</span> {new Date(mediaData.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DialogSubtitleManager
        media={mediaData}
        open={showSubtitleDialog}
        onOpenChange={setShowSubtitleDialog}
        onSubtitleUpdate={(subtitle) => {
          setMediaData((prev: Media) => ({
            ...prev,
            subtitles: subtitle ? [subtitle] : []
          }))
        }}
      />
    </>
  )
}

