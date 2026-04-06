import { RoadmapContent, getRoadmapData } from '@/features/roadmap'

export default async function page() {
  const { roadmapData } = await getRoadmapData()

  return <RoadmapContent roadmapData={roadmapData} />
}
