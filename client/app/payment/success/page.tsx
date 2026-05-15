import PaymentResultPage from '@/features/upgrade/components/PaymentResultPage'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultPage />
    </Suspense>
  )
}