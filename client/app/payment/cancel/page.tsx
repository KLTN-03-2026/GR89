import PaymentCancelPage from '@/features/upgrade/components/PaymentCancelPage'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelPage />
    </Suspense>
  )
}