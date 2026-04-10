'use client'
import { useEffect, useState, useMemo } from "react";
import HeaderRoamap from "@/features/roadmap/components/header";
import LessonsRoadmap from "@/features/roadmap/components/lessons";
import TopicsRoadmap from "@/features/roadmap/components/topics";
import { RoadmapLesson, RoadmapTopic } from "@/features/roadmap/types";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useRouter } from "next/navigation";
import { getRoadmapTopicLessons, reorderRoadmapTopics, updateLessonVisibility } from "@/features/roadmap/services/api";
import { toast } from "react-toastify";

interface RoadmapAdminPageProps {
  topics: RoadmapTopic[];
}

export function RoadmapAdminPage({ topics }: RoadmapAdminPageProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    topics[0]?._id || null
  );
  const [selectedTopicLessons, setSelectedTopicLessons] = useState<RoadmapLesson[]>([]);

  const router = useRouter()

  // Derived state: selectedTopic luôn được tính từ topics
  const selectedTopic = useMemo(() => {
    return topics.find(t => t._id === selectedTopicId) || topics[0] || null;
  }, [topics, selectedTopicId]);

  useEffect(() => {
    if (!selectedTopicId) {
      setSelectedTopicLessons([]);
      return;
    }

    const fetchTopicLessons = async () => {
      try {
        const res = await getRoadmapTopicLessons(selectedTopicId);
        if (res.success) {
          setSelectedTopicLessons((res.data || []) as RoadmapLesson[]);
        } else {
          setSelectedTopicLessons([]);
          toast.error(res.message || "Không thể tải danh sách bài học");
        }
      } catch {
        setSelectedTopicLessons([]);
        toast.error("Không thể tải danh sách bài học");
      }
    };

    fetchTopicLessons();
  }, [selectedTopicId]);

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
  }


  const handleLessonUpdate = async (roadmapId: string, lessonId: string, isActive: boolean) => {
    await updateLessonVisibility(roadmapId, lessonId, isActive || false)
      .then(() => {
        toast.success("Cập nhật bài học thành công")
      })
      .finally(() => {
        router.refresh()
      })
  }

  const handleTopicDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTopic = topics.find(t => t._id === String(active.id));
    const overTopic = topics.find(t => t._id === String(over.id));
    if (!activeTopic || !overTopic) return;

    const activeOrderIndex = activeTopic.orderIndex;
    const overOrderIndex = overTopic.orderIndex;
    if (activeOrderIndex === overOrderIndex) return;

    const reorderedTopics = topics.map((topic) => {
      if (topic._id === activeTopic._id) return { ...topic, orderIndex: overOrderIndex };
      if (activeOrderIndex < overOrderIndex) {
        if (topic.orderIndex > activeOrderIndex && topic.orderIndex <= overOrderIndex) {
          return { ...topic, orderIndex: topic.orderIndex - 1 };
        }
      } else if (topic.orderIndex >= overOrderIndex && topic.orderIndex < activeOrderIndex) {
        return { ...topic, orderIndex: topic.orderIndex + 1 };
      }
      return topic;
    });

    try {
      const response = await reorderRoadmapTopics(
        reorderedTopics.map((topic) => ({
          topicId: topic._id,
          orderIndex: topic.orderIndex,
        }))
      );

      if (!response.success) {
        toast.error(response.message || "Cập nhật thứ tự chủ đề thất bại");
        return;
      }
      toast.success(response.message || "Đã cập nhật thứ tự chủ đề");
    } catch {
      toast.error("Cập nhật thứ tự chủ đề thất bại");
    } finally {
      router.refresh();
    }
  };

  // setup sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  //handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    // active: item đang được kéo
    // over: vị trí item thả
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Tìm topic chứa lesson đang được kéo
    const sourceTopic = selectedTopic

    if (!sourceTopic) return

    // Tìm lesson đang kéo (active) và lesson ở vị trí thả (over)
    const activeLesson = selectedTopicLessons.find(lesson => lesson._id === active.id);
    const overLesson = selectedTopicLessons.find(lesson => lesson._id === over.id);

    if (!sourceTopic || !activeLesson || !overLesson) return;

    const activeOrderIndex = activeLesson.orderIndex;
    const overOrderIndex = overLesson.orderIndex;
    if (activeOrderIndex === overOrderIndex) return;

    router.refresh();
  }

  if (!selectedTopic) {
    return (
      <div>
        <HeaderRoamap />
        <div className="p-8 text-center text-gray-500">
          <p>{"Chưa có chủ đề nào. Hãy tạo chủ đề mới để bắt đầu."}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <HeaderRoamap />

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopicDragEnd}>
          <SortableContext
            items={topics.map((topic) => topic._id)}
            strategy={verticalListSortingStrategy}
          >
            <TopicsRoadmap
              topics={topics}
              handleSelectTopic={handleSelectTopic}
              selectedTopic={selectedTopic}
            />
          </SortableContext>
        </DndContext>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedTopicLessons.length > 0 ? selectedTopicLessons.map((lesson) => lesson._id) : []}
            strategy={verticalListSortingStrategy}
          >
            <LessonsRoadmap
              selectedTopic={{ ...selectedTopic, lessons: selectedTopicLessons }}
              onLessonUpdate={handleLessonUpdate}
            />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
