'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Entertainment } from '../../types'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'
import { Play } from 'lucide-react'
import ActionsCell from './ActionsCell'
import { CreatorBadge } from '@/components/common/shared/CreatorInfo'

function VideoThumb({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false)
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  const getYouTubeEmbedUrl = (u: string) => {
    if (u.includes('youtu.be/')) {
      const id = u.split('youtu.be/')[1]?.split('?')[0] || ''
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.includes('youtube.com/watch')) {
      const id = u.split('v=')[1]?.split('&')[0] || ''
      return `https://www.youtube.com/embed/${id}`
    }
    return u
  }
  const getYouTubeThumbnail = (u: string) => {
    if (u.includes('youtu.be/')) {
      const id = u.split('youtu.be/')[1]?.split('?')[0] || ''
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    }
    if (u.includes('youtube.com/watch')) {
      const id = u.split('v=')[1]?.split('&')[0] || ''
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    }
    return ''
  }
  const thumb = isYouTube ? getYouTubeThumbnail(url) : ''
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(url) : url
  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        className="group relative w-[50px] h-[50px] border border-gray-200 rounded overflow-hidden"
        onClick={() => setOpen(true)}
      >
        {isYouTube ? (
          <Image src={thumb} alt={title} width={80} height={80} className="w-full h-full object-cover" />
        ) : (
          <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-6 h-6 text-white" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[800px] w-[90vw] p-0">
          <div className="w-full aspect-video">
            {isYouTube ? (
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
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

export const columnsEntertainment = (
  callback: () => void,
  onManageEpisodes?: (parentId: string, title: string) => void
): ColumnDef<Entertainment>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    { accessorKey: 'title', header: 'Tiêu đề' },
    { accessorKey: 'author', header: 'Tác giả', cell: ({ row }) => <div className="text-sm">{row.original.author || '-'}</div> },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const type = row.original.type
        const variant =
          type === 'movie'
            ? 'default'
            : type === 'music'
              ? 'secondary'
              : type === 'series'
                ? 'destructive'
                : type === 'episode'
                  ? 'outline'
                  : 'outline'

        const labelMap: Record<string, string> = {
          movie: 'Phim lẻ',
          series: 'Phim bộ',
          episode: 'Tập phim',
          music: 'Âm nhạc',
          podcast: 'Podcast'
        }
        const label = type ? labelMap[type] || type : '-'

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant as any}>{label}</Badge>
            {type === 'episode' && row.original.orderIndex !== undefined && (
              <span className="text-[10px] text-muted-foreground italic">Tập {row.original.orderIndex}</span>
            )}
          </div>
        )
      }
    },
    {
      id: 'video',
      header: 'Video',
      cell: ({ row }) => {
        const v = row.original.videoUrl as unknown as { url?: string } | string | null
        const url = typeof v === 'string' ? v : v?.url
        return url ? <VideoThumb url={url} title={row.original.title} /> : <Badge variant="secondary">Chưa có</Badge>
      }
    },
    {
      id: 'thumbnail',
      header: 'Thumbnail',
      cell: ({ row }) => {
        const t = row.original.thumbnailUrl as unknown as { url?: string } | string | null
        const url = typeof t === 'string' ? t : t?.url
        return url ? (
          <Image src={url} alt={row.original.title} width={50} height={50} className="w-[50px] h-[50px] object-cover border rounded" />
        ) : (
          <Badge variant="secondary">Chưa có</Badge>
        )
      }
    },
    {
      id: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <Badge variant={row.original.status ? 'default' : 'secondary'}>{row.original.status ? 'Hoạt động' : 'Ẩn'}</Badge>
    },
    {
      id: 'isVipRequired',
      header: () => <div className="text-center">VIP</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge
            variant={row.original.isVipRequired ? 'default' : 'secondary'}
            className={row.original.isVipRequired ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            {row.original.isVipRequired ? 'VIP' : 'Thường'}
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'Người tạo',
      header: () => <div className="text-center">Người tạo</div>,
      cell: ({ row }) => {
        const entertainment = row.original
        if (!entertainment.createdBy) {
          return <div className="text-center text-muted-foreground">-</div>
        }
        return (
          <div className="flex justify-center">
            <CreatorBadge createdBy={entertainment.createdBy} />
          </div>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsCell entertainment={row.original} callback={callback} onManageEpisodes={onManageEpisodes} />
    }
  ]

