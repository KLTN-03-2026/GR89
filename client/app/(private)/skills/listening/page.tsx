import { ListeningPage, getListeningData } from '@/features/listening'

export default async function page() {
  const { overview, listenings } = await getListeningData()

  return <ListeningPage overview={overview} listenings={listenings} />
}
