'use client'
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface props {
  _id: string
}

export function HeaderIpaLearning({ _id }: props) {
  const router = useRouter()

  const handleStartQuiz = () => {
    router.push(`/quizz/ipa/${_id}`)
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft /> Quay lại
      </div>

      <Button onClick={handleStartQuiz}>Bắt đầu kiểm tra <ArrowRight /></Button>
    </div>
  )
}
