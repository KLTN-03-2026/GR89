"use client"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import { swapVocabularyTopicOrder } from "@/features/vocabulary/services/api"
import { VocabularyTopic } from "@/features/vocabulary/types"

interface OrderIndexCellProps {
  topic: VocabularyTopic
  allTopics: VocabularyTopic[]
  callback: () => void
  onSwap?: (topicId: string, direction: 'up' | 'down') => void
}

export default function OrderIndexCell({ topic, allTopics, callback, onSwap }: OrderIndexCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Tìm min và max orderIndex trong danh sách hiện tại
  const orderIndexes = allTopics.map(t => t.orderIndex).sort((a, b) => a - b)
  const minOrderIndex = orderIndexes[0]
  const maxOrderIndex = orderIndexes[orderIndexes.length - 1]

  const canMoveUp = topic.orderIndex > minOrderIndex
  const canMoveDown = topic.orderIndex < maxOrderIndex

  const handleSwap = async (direction: 'up' | 'down') => {
    if (isLoading || isAnimating) return

    // Optimistic update - cập nhật ngay lập tức
    if (onSwap) {
      setIsAnimating(true)
      onSwap(topic._id, direction)

      // Animation duration
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }

    setIsLoading(true)
    try {
      await swapVocabularyTopicOrder(topic._id, direction)
      toast.success(`Đã di chuyển chủ đề ${direction === 'up' ? 'lên' : 'xuống'} thành công`)
      // Chỉ refresh nếu không có optimistic update
      if (!onSwap) {
        callback()
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `Di chuyển ${direction === 'up' ? 'lên' : 'xuống'} thất bại`
      toast.error(errorMessage)
      // Rollback nếu có lỗi
      if (onSwap) {
        callback()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-gray-100 disabled:opacity-30 transition-all"
        onClick={() => handleSwap('up')}
        disabled={!canMoveUp || isLoading || isAnimating}
        title="Di chuyển lên"
      >
        <ArrowUp className={`h-4 w-4 transition-transform ${isAnimating ? 'scale-110' : ''}`} />
      </Button>
      <span className={`text-center font-medium min-w-[32px] transition-all duration-300 ${isAnimating ? 'scale-110 text-blue-600' : ''}`}>
        {topic.orderIndex}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-gray-100 disabled:opacity-30 transition-all"
        onClick={() => handleSwap('down')}
        disabled={!canMoveDown || isLoading || isAnimating}
        title="Di chuyển xuống"
      >
        <ArrowDown className={`h-4 w-4 transition-transform ${isAnimating ? 'scale-110' : ''}`} />
      </Button>
    </div>
  )
}

