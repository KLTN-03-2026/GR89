"use client"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Ipa } from "@/features/IPA/types"
import ActionsCell from "./ActionsCell"
import { useState } from "react"
import { Play } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreatorBadge } from "@/components/common/shared/CreatorInfo"
import OrderIndexCell from "./OrderIndexCell"

function getYouTubeEmbedUrl(url: string): string {
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0] || ""
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}

function VideoPreview({ videoUrl, sound }: { videoUrl: string | { url?: string } | null | undefined; sound: string }) {
  const [open, setOpen] = useState(false)

  // Ensure videoUrl is a string
  const url = typeof videoUrl === 'string' ? videoUrl : (videoUrl?.url || '')

  if (!url) {
    return (
      <div className="w-[50px] h-[50px] border border-gray-200 rounded flex items-center justify-center text-gray-400">
        No video
      </div>
    )
  }

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be")
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(url) : url

  // Lấy YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || ""
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return ""
  }


  return (
    <>
      <button
        type="button"
        className="group mx-auto relative w-[50px] h-[50px] border border-gray-200 rounded overflow-hidden"
        onClick={() => setOpen(true)}
        aria-label="Open video"
      >
        {isYouTube ? (
          <Image
            src={getYouTubeThumbnail(url)}
            alt={sound}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-6 h-6 text-white opacity-90 group-hover:scale-110 transition-transform" />
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
    </>
  )
}


const typeSoundVietnamese = {
  "vowel": {
    "name": "Nguyên âm",
    "color": "bg-blue-500"
  },
  "consonant": {
    "name": "Phụ âm",
    "color": "bg-red-500"
  },
  "diphthong": {
    "name": "Nguyên âm đôi",
    "color": "bg-green-500"
  }
}

export const columnsIpa = (callback: () => void, allIpas: Ipa[]): ColumnDef<Ipa>[] => [
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
    id: "Âm",
    accessorKey: "sound",
    header: () => <div className="text-center">Âm</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.sound}</div>
    }
  },

  {
    accessorKey: "Loại âm",
    header: () => <div className="text-center">Loại âm</div>,
    cell: ({ row }) => {
      return <div className="text-center">
        <Badge className={typeSoundVietnamese[row.original.soundType].color}>
          {typeSoundVietnamese[row.original.soundType].name}
        </Badge>
      </div>
    }
  },

  {
    accessorKey: "Video hướng dẫn",
    header: () => <div className="text-center">Video hướng dẫn</div>,
    cell: ({ row }) => {
      return <div className="flex items-center">
        <VideoPreview
          videoUrl={row.original.video}
          sound={row.original.sound}
        />
      </div>
    }
  },

  {
    accessorKey: "Khẩu hình miệng",
    header: () => <div className="text-center">Khẩu hình miệng</div>,
    cell: ({ row }) => {
      return <div className="flex items-center">
        <VideoPreview
          videoUrl={row.original.image}
          sound={row.original.sound}
        />
      </div>
    }
  },

  {
    accessorKey: "Mô tả khẩu hình miệng",
    header: "Mô tả khẩu hình miệng",
    cell: ({ row }) => {
      return <div className="line-clamp-1">{row.original.description}</div>
    }
  },

  {
    accessorKey: "isActive",
    header: () => <div className="text-center">Trạng thái</div>,
    cell: ({ row }) => {
      return <div className="text-center">
        {row.original.isActive ? <Badge variant="secondary">Đã xuất bản</Badge> : <Badge variant="destructive">Chưa xuất bản</Badge>}
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
      const ipa = row.original
      if (!ipa.createdBy) {
        return <div className="text-center text-muted-foreground">-</div>
      }
      return (
        <div className="flex justify-center">
          <CreatorBadge createdBy={ipa.createdBy} />
        </div>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <OrderIndexCell ipa={row.original} allIpas={allIpas} callback={callback} />
        <ActionsCell ipa={row.original} callback={callback} />
      </div>
    )
  },
]