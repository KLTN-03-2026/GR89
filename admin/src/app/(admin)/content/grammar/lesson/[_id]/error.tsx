'use client'

import { CommonError } from "@/components/common/shared"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <CommonError
      error={error}
      reset={reset}
      message="Không thể tải dữ liệu bài học Ngữ Pháp lúc này. Vui lòng thử lại sau."
    />
  )
}
