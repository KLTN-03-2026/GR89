import { IpaExampleMain } from '@/features/IPA'
import { getIpaByIdServer } from '@/features/IPA/services/serverApi'
import { notFound } from 'next/navigation'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const ipa = await getIpaByIdServer(_id)

  if (!ipa) {
    notFound()
  }

  return (
    <IpaExampleMain
      _id={_id}
      initialData={ipa}
    />
  )
}
