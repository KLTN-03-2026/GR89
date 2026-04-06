import { ReadingQuizDetailMain } from '@/features/reading'

export default function Page({ params }: { params: { _id: string } }) {
  return (
    <div>
      <ReadingQuizDetailMain _id={params._id} />
    </div>
  )
}
