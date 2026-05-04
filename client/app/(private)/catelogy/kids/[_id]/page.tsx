import { getClassById } from "@/features/catelogies/services/serverApi"
import { ClassDetailPageClient } from "@/features/catelogies/components/ClassDetailPageClient"

export default async function ClassDetailPage({ params }: { params: { _id: string } }) {
  const {_id} = await params
  const classItem = await getClassById(_id)
  return <ClassDetailPageClient classItem={classItem} />
}
