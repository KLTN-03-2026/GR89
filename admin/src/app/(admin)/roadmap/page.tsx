import { RoadmapAdminPage } from "@/features/roadmap";
import { RoadmapTopic } from "@/features/roadmap/types";
import { fetchServer } from "@/lib/apis/fetch-server";

export default async function page() {
  const topics = (await fetchServer<RoadmapTopic[]>('/roadmap/topics') || []).map((topic) => ({
    ...topic,
    lessons: [],
  }))

  return <RoadmapAdminPage topics={topics} />
}
