import { HomeworkMain } from '@/features/center-management/classes/components/Homework/HomeworkMain/HomeworkMain'
import { getCenterClassByIdServer } from '@/features/center-management/classes/services/serverApi'

interface PageProps {
  params: Promise<{
    _id: string
  }>
}

export default async function ClassHomeworkPage({ params }: PageProps) {
  const { _id } = await params
  const classData = await getCenterClassByIdServer(_id)

  return <HomeworkMain initialData={classData} />
}
