import { ClassDetailPageClient } from "@/features/catelogies"
import { getClassById } from "@/features/catelogies/services/serverApi"

export default async function ClassDetailPage({ params }: { params: { _id: string } }) {
  const {_id} = await params
  const classItem = await getClassById(_id)
  return <ClassDetailPageClient classItem={classItem} />
}
