'use client'
import { useRouter } from "next/navigation";
import SpeakingContent from "./SpeakingContent";
import SpeakingHeader from "./SpeakingHeader";
import { Speaking } from "@/features/speaking/types";

interface SpeakingMainProps {
  initialData: Speaking[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    next: number | null
    prev: number | null
  }
  initialStats: any
}

export function SpeakingMain({ initialData, pagination, initialStats }: SpeakingMainProps) {
  const router = useRouter()

  return (
    <div>
      <SpeakingHeader callback={() => router.refresh()} initialStats={initialStats} />
      <SpeakingContent 
        callback={() => router.refresh()} 
        initialData={initialData}
        pagination={pagination}
      />
    </div>
  )
}
