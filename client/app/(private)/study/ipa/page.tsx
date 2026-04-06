import { IpaPage, getIpaData } from '@/features/ipa'

export default async function page() {
  const { overview, ipaList } = await getIpaData()

  return <IpaPage overview={overview} ipaList={ipaList} />
}