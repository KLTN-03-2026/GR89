import { RoadmapAdminPage } from "@/features/roadmap";
import { RoadmapTopic } from "@/features/roadmap/types";
import { fetchServer } from "@/lib/apis/fetch-server";

export default async function page() {
  const topics = (await fetchServer<RoadmapTopic[]>('/roadmap/topics') || [])

  return <RoadmapAdminPage topics={topics.data || []} />
}
