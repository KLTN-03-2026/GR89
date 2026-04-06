import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { deleteMedia, updateMediaTitle } from '@/features/Media/services/api'
import { Media } from '@/features/Media/types'
import { Copy, ExternalLink, Music2, Trash2, Hash, Pencil, Check, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface props {
  item: Media
  onLoading: (is: boolean) => void
  onMeta: (duration?: number) => void
  callback: () => void
}

export default function AudioCard({ item, onLoading, onMeta, callback }: props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(item.title || item.publicId || item.url.split('/').pop() || 'Untitled')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onLoadStart = () => onLoading(true)
    const onLoaded = () => onMeta(el.duration)
    const onError = () => onMeta(undefined)
    el.addEventListener('loadstart', onLoadStart)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('loadstart', onLoadStart)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('error', onError)
    }
  }, [item.url, onLoading, onMeta])

  useEffect(() => {
    setEditedTitle(item.title || item.publicId || item.url.split('/').pop() || 'Untitled')
  }, [item.title, item.publicId, item.url])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.url)
      toast.success('Đã sao chép liên kết')
    }
    catch {
      toast.error('Không thể sao chép')
    }
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(item._id)
      toast.success('Đã sao chép ID')
    }
    catch {
      toast.error('Không thể sao chép')
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteMedia(item._id)
      .then(() => {
        toast.success('Đã xóa audio')
        callback()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedTitle(item.title || item.publicId || item.url.split('/').pop() || 'Untitled')
    setIsEditing(false)
  }

  const handleSaveTitle = async () => {
    const trimmedTitle = editedTitle.trim()
    if (!trimmedTitle) {
      toast.error('Tên không được để trống')
      return
    }

    if (trimmedTitle === (item.title || item.publicId || item.url.split('/').pop() || 'Untitled')) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    await updateMediaTitle(item._id, trimmedTitle)
      .then(() => {
        toast.success('Đã cập nhật tên')
        callback()
        setIsEditing(false)
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
      <CardContent className="p-4 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <Music2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-1 w-full">
                  <Input
                    ref={inputRef}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                    className="h-7 text-sm flex-1 min-w-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveTitle}
                    disabled={isSaving}
                    className="h-7 w-7 p-0 flex-shrink-0"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-7 w-7 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div
                  className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors group flex items-center gap-1"
                  onClick={handleStartEdit}
                  title="Click để đổi tên"
                >
                  <span className="truncate">{item.title || item.publicId || item.url.split('/').pop() || 'Untitled'}</span>
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              )}
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <span>{item.format?.toUpperCase() || 'AUDIO'} File</span>
                {item.size && <span>• {Math.round(item.size / 1024)}KB</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700 flex-shrink-0" disabled={isLoading}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Audio Player */}
        <div className="mb-4">
          <audio ref={audioRef} controls preload="metadata" className="w-full">
            <source src={item.url} />
            Trình duyệt của bạn không hỗ trợ audio.
          </audio>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={copy} className="text-xs">
            <Copy className="w-3 h-3 mr-1" />
            Link
          </Button>
          <Button variant="outline" size="sm" onClick={copyId} className="text-xs">
            <Hash className="w-3 h-3 mr-1" />
            ID
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(item.url, '_blank')} className="text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            Mở
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}