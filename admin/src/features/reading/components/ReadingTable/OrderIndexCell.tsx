"use client"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Reading } from "@/features/reading/types"
import { useState } from "react"
import { toast } from "react-toastify"
import { swapReadingOrder } from "@/features/reading/services/api"

interface OrderIndexCellProps {
  reading: Reading
  allReadings: Reading[]
  callback: () => void
  onSwap?: (readingId: string, direction: 'up' | 'down') => void
}

export default function OrderIndexCell({ reading, allReadings, callback, onSwap }: OrderIndexCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const orderIndexes = allReadings.map(r => r.orderIndex).sort((a, b) => a - b)
  const minOrderIndex = orderIndexes[0]
  const maxOrderIndex = orderIndexes[orderIndexes.length - 1]

  const canMoveUp = reading.orderIndex > minOrderIndex
  const canMoveDown = reading.orderIndex < maxOrderIndex

  const handleSwap = async (direction: 'up' | 'down') => {
    if (isLoading || isAnimating) return

    if (onSwap) {
      setIsAnimating(true)
      onSwap(reading._id, direction)
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }

    setIsLoading(true)
    try {
      await swapReadingOrder(reading._id, direction)
      toast.success(`Đã di chuyển reading ${direction === 'up' ? 'lên' : 'xuống'} thành công`)
      if (!onSwap) {
        callback()
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `Di chuyển ${direction === 'up' ? 'lên' : 'xuống'} thất bại`
      toast.error(errorMessage)
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
        {reading.orderIndex}
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

