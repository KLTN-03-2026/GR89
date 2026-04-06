import { ListeningHeader } from './ListeningHeader'
import { ListeningTopic } from './ListeningTopic'
import { ListeningOverview } from '@/libs/apis/api'
import { IListening } from '@/features/listening/types'

interface ListeningPageProps {
  overview: ListeningOverview
  listenings: IListening[]
}

export function ListeningPage({ overview, listenings }: ListeningPageProps) {
  return (
    <>
      <ListeningHeader overview={overview} />
      <ListeningTopic listenings={listenings} />
    </>
  )
}

