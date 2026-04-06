import { IPAHeader } from './IPAHeader'
import { ListCardIpa } from './ListCardIpa'
import { IpaOverview } from '@/libs/apis/api'
import { IIpa } from '@/features/ipa/types'

interface IpaPageProps {
  overview: IpaOverview
  ipaList: IIpa[]
}

export function IpaPage({ overview, ipaList }: IpaPageProps) {
  return (
    <div>
      <IPAHeader overview={overview} />
      <div className="mt-8">
        <ListCardIpa ipaList={ipaList} />
      </div>
    </div>
  )
}

