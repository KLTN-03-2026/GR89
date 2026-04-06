"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Speaking } from "@/features/speaking/types"
import ActionsCell from "./ActionCell"
import { CreatorBadge } from "@/components/common"
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'
import { Play } from 'lucide-react'

function SpeakingVideoCell({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [open, setOpen] = useState(false)
  const url = videoUrl
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  const isVimeo = url.includes('vimeo.com')

  const getYouTubeEmbedUrl = (u: string) => {
    if (u.includes('youtu.be/')) { const id = u.split('youtu.be/')[1]?.split('?')[0] || ''; return `https://www.youtube.com/embed/${id}` }
    if (u.includes('youtube.com/watch')) { const id = u.split('v=')[1]?.split('&')[0] || ''; return `https://www.youtube.com/embed/${id}` }
    return u
  }
  const getYouTubeThumbnail = (u: string) => {
    if (u.includes('youtu.be/')) { const id = u.split('youtu.be/')[1]?.split('?')[0] || ''; return `https://img.youtube.com/vi/${id}/maxresdefault.jpg` }
    if (u.includes('youtube.com/watch')) { const id = u.split('v=')[1]?.split('&')[0] || ''; return `https://img.youtube.com/vi/${id}/maxresdefault.jpg` }
    return ''
  }

  const getVimeoEmbedUrl = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl)
      if (!parsed.hostname.includes('vimeo.com')) return rawUrl
      const segments = parsed.pathname.split('/').filter(Boolean)
      const id = segments[0]
      if (!id) return rawUrl
      const hashSegment = segments[1]
      const url = new URL(`https://player.vimeo.com/video/${id}`)
      if (hashSegment) {
        url.searchParams.set('h', hashSegment)
      }
      // preserve query params like autoplay=1
      parsed.searchParams.forEach((value, key) => {
        if (key !== 'h') url.searchParams.set(key, value)
      })
      return url.toString()
    } catch {
      const fallbackMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)
      return fallbackMatch?.[1] ? `https://player.vimeo.com/video/${fallbackMatch[1]}` : rawUrl
    }
  }

  const getVimeoThumbnail = (rawUrl: string) => {
    const match = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match?.[1] ? `https://vumbnail.com/${match[1]}.jpg` : ''
  }

  const thumb = isYouTube ? getYouTubeThumbnail(url) : isVimeo ? getVimeoThumbnail(url) : ''
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(url) : isVimeo ? getVimeoEmbedUrl(url) : url

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        className="group relative w-[50px] h-[50px] border border-gray-200 rounded overflow-hidden"
        onClick={() => setOpen(true)}
        aria-label="Open video"
      >
        {isYouTube && thumb ? (
          <Image src={thumb} alt={title} width={80} height={80} className="w-full h-full object-cover" />
        ) : isVimeo && thumb ? (
          <Image src={thumb} alt={title} width={80} height={80} className="w-full h-full object-cover" />
        ) : isVimeo ? (
          <div className="w-full h-full flex items-center justify-center bg-black text-xs text-white">
            Vimeo
          </div>
        ) : (
          <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-6 h-6 text-white opacity-90 group-hover:scale-110 transition-transform" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[800px] w-[90vw] p-0">
          <div className="w-full aspect-video">
            {isYouTube || isVimeo ? (
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full h-full">
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const columnsSpeaking = (callback: () => void, speakings: Speaking[], onSwap?: (speakingId: string, direction: 'up' | 'down') => void): ColumnDef<Speaking>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Tiêu đề",
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      return <div className="line-clamp-1">{row.original.title}</div>
    }
  },
  {
    id: "Level",
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <Badge variant="outline">{row.original.level}</Badge>
  },
  {
    id: "Mô tả",
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => {
      return <div className="line-clamp-1" title={row.original.description}>
        {row.original.description}
      </div>
    }
  },
  {
    accessorKey: "Video",
    header: "Video",
    cell: ({ row }) => {
      const video = row.original.videoUrl as unknown as { url?: string } | string | null
      const url = typeof video === 'string' ? video : video?.url
      if (!url) return <div className="text-center text-muted-foreground">-</div>
      return <SpeakingVideoCell videoUrl={url} title={row.original.title} />
    }
  },
  {
    accessorKey: "Trạng thái",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <div>
        {row.original.isActive ? <Badge variant="secondary">Hoạt động</Badge> : <Badge variant="destructive">Không hoạt động</Badge>}
      </div>
    }
  },

  {
    accessorKey: "isVipRequired",
    header: () => <div className="text-center">VIP</div>,
    cell: ({ row }) => {
      return <div className="text-center">
        {row.original.isVipRequired ? (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">VIP</Badge>
        ) : (
          <Badge variant="secondary">Thường</Badge>
        )}
      </div>
    }
  },

  {
    accessorKey: "Người tạo",
    header: () => <div className="text-center">Người tạo</div>,
    cell: ({ row }) => {
      const speaking = row.original
      if (!speaking.createdBy) {
        return <div className="text-center text-muted-foreground">-</div>
      }
      return (
        <div className="flex justify-center">
          <CreatorBadge
            createdBy={speaking.createdBy}
          />
        </div>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell speaking={row.original} allSpeakings={speakings} callback={callback} onSwap={onSwap} />
  },
]
