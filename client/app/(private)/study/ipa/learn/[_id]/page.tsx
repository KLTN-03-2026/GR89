import { HeaderIpaLearning, IpaLearning, IIpa } from "@/features/ipa"
import { fetchServer } from "@/libs/apis/fetch-server"

export default async function page({ params }: { params: { _id: string } }) {
  const { _id } = await params

  const ipaData = await fetchServer<IIpa>(`/ipa/user/${_id}`)

  return (
    <div className="max-w-7xl mx-auto">
      <HeaderIpaLearning _id={_id} />
      <IpaLearning ipaData={ipaData} />
    </div>
  )
}
