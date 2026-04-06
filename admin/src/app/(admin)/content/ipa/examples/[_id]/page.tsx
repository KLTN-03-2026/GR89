import { IpaExampleMain } from '@/features/IPA'

export default async function page({ params }: { params: { _id: string } }) {
  const { _id } = await params
  return (
    <div>
      <IpaExampleMain ipaId={_id} />
    </div>
  )
}
