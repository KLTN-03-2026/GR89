import { DocumentsMain } from '@/features/center-management/classes/components/Document/DocumentsMain/DocumentsMain'
import { getCenterClassByIdServer } from '@/features/center-management/classes/services/serverApi'

interface PageProps {
  params: Promise<{
    _id: string
  }>
}

export default async function DocumentsPage({ params }: PageProps) {
  const { _id } = await params
  const classData = await getCenterClassByIdServer(_id)

  return <DocumentsMain initialData={classData} />
}
