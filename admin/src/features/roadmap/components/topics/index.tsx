import CardTopic from "./CardTopic";
import { RoadmapTopic } from "../type";

interface TopicsRoadmapProps {
  topics: RoadmapTopic[];
  selectedTopic: RoadmapTopic;
  handleSelectTopic: (topicId: string) => void;
}

export default function TopicsRoadmap({
  topics,
  selectedTopic,
  handleSelectTopic,
}: TopicsRoadmapProps) {
  return (
    <div className="p-4 border-r-1  h-[calc(100vh-180px)]  overflow-hidden border-gray-200">
      <h2 className="text-md font-semibold mb-4">Danh sách chủ đề</h2>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {
          topics.map((topic) => (
            <CardTopic
              key={topic._id}
              topic={topic}
              index={topic.orderIndex}
              isSelected={selectedTopic._id === topic._id}
              onSelect={handleSelectTopic}
            />
          ))
        }
      </div>
    </div>
  )
}
