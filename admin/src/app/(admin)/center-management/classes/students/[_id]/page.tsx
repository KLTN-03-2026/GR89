import { StudentsMain } from '@/features/center-management/classes/components/Student/StudentsMain/StudentsMain'
import { getCenterClassByIdServer } from '@/features/center-management/classes/services/serverApi'

interface PageProps {
  params: Promise<{
    _id: string
  }>
}

export default async function StudentsPage({ params }: PageProps) {
  const { _id } = await params
  const classData = await getCenterClassByIdServer(_id)

  return <StudentsMain initialData={classData} classId={_id} />
}
