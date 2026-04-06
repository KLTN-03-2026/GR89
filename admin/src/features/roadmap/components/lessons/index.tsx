import { RoadmapTopic } from "@/features/roadmap/types";
import CardAddLesson from "./CardAddLesson";
import CardLesson from "./CardLesson";
import { BookOpen } from "lucide-react";

interface LessonsRoadmapProps {
  selectedTopic: RoadmapTopic;
  onLessonUpdate?: (roadmapId: string, lessonId: string, isActive: boolean) => void;
  onLessonsChange?: () => void;
}

export default function LessonsRoadmap({ selectedTopic, onLessonUpdate, onLessonsChange }: LessonsRoadmapProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Unit {selectedTopic.orderIndex}: {selectedTopic.title}</h2>
          <p className="text-sm text-gray-500">{selectedTopic.description}</p>
        </div>

      </div>

      <div className="mt-4 flex flex-col gap-2 h-[calc(100vh-370px)] overflow-y-auto">
        {selectedTopic.lessons && selectedTopic.lessons.length > 0 ? (
          selectedTopic.lessons.map((lesson) => (
            <CardLesson key={lesson._id} lesson={lesson} roadmapId={selectedTopic._id} onLessonUpdate={onLessonUpdate} onLessonsChange={onLessonsChange} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-12 px-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chưa có bài học nào
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Bắt đầu tạo bài học mới cho chủ đề này bằng cách sử dụng nút bên dưới
            </p>
          </div>
        )}
      </div>

      <CardAddLesson roadmapId={selectedTopic._id} onLessonsChange={onLessonsChange} />
    </div>
  )
}
