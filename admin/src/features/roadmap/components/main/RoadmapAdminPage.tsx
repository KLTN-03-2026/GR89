'use client'
import { useCallback, useEffect, useMemo, useState } from "react";
import HeaderRoamap from "@/features/roadmap/components/header";
import LessonsRoadmap from "@/features/roadmap/components/lessons";
import TopicsRoadmap from "@/features/roadmap/components/topics";
import { RoadmapLesson, RoadmapTopic } from "@/features/roadmap/types";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useRouter } from "next/navigation";
import { getRoadmapTopicLessons, reorderRoadmapLessons, reorderRoadmapTopics, updateLessonVisibility } from "@/features/roadmap/services/api";
import { toast } from "react-toastify";

interface RoadmapAdminPageProps {
  topics: RoadmapTopic[];
}

export function RoadmapAdminPage({ topics }: RoadmapAdminPageProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    topics[0]?._id || null
  );
  const [selectedTopicLessons, setSelectedTopicLessons] = useState<RoadmapLesson[]>([]);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false)
  const [isLessonsReordering, setIsLessonsReordering] = useState(false)

  const router = useRouter()

  // Derived state: selectedTopic luôn được tính từ topics
  const selectedTopic = useMemo(() => {
    return topics.find(t => t._id === selectedTopicId) || topics[0] || null;
  }, [topics, selectedTopicId]);

  const fetchTopicLessons = useCallback(async (topicId: string) => {
    setIsLessonsLoading(true)
    setSelectedTopicLessons([])
    try {
      const res = await getRoadmapTopicLessons(topicId)
      if (res.success) {
        const nextLessons = ((res.data || []) as RoadmapLesson[]).slice().sort((a, b) => a.orderIndex - b.orderIndex)
        setSelectedTopicLessons(nextLessons)
      } else {
        setSelectedTopicLessons([])
        toast.error(res.message || "Không thể tải danh sách bài học")
      }
    } catch {
      setSelectedTopicLessons([])
      toast.error("Không thể tải danh sách bài học")
    } finally {
      setIsLessonsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedTopicId) {
      setSelectedTopicLessons([])
      return
    }
    fetchTopicLessons(selectedTopicId)
  }, [fetchTopicLessons, selectedTopicId])

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setSelectedTopicLessons([])
  }

  const handleLessonsChange = useCallback(async () => {
    if (!selectedTopicId) return
    await fetchTopicLessons(selectedTopicId)
    router.refresh()
  }, [fetchTopicLessons, router, selectedTopicId])

  const handleLessonUpdate = async (roadmapId: string, lessonId: string, isActive: boolean) => {
    await updateLessonVisibility(roadmapId, lessonId, isActive || false)
      .then(() => {
        toast.success("Cập nhật bài học thành công")
      })
      .finally(async () => {
        await fetchTopicLessons(roadmapId)
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

    if (isLessonsLoading || isLessonsReordering) return

    const sourceTopic = selectedTopic
    if (!sourceTopic) return

    const oldIndex = selectedTopicLessons.findIndex((l) => l._id === String(active.id))
    const newIndex = selectedTopicLessons.findIndex((l) => l._id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    if (oldIndex === newIndex) return

    const prevLessons = selectedTopicLessons.slice()
    const reordered = arrayMove(prevLessons, oldIndex, newIndex).map((lesson, idx) => ({
      ...lesson,
      orderIndex: idx + 1,
    }))

    setSelectedTopicLessons(reordered)
    setIsLessonsReordering(true)

    try {
      const res = await reorderRoadmapLessons(
        sourceTopic._id,
        reordered.map((lesson) => ({
          lessonId: lesson._id,
          orderIndex: lesson.orderIndex,
        }))
      )

      if (!res.success) {
        throw new Error(res.message || "Cập nhật thứ tự bài học thất bại")
      }

      toast.success(res.message || "Đã cập nhật thứ tự bài học")
    } catch {
      setSelectedTopicLessons(prevLessons)
      toast.error("Cập nhật thứ tự bài học thất bại")
    } finally {
      setIsLessonsReordering(false)
      router.refresh()
    }
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
              loadingTopicId={isLessonsLoading ? selectedTopicId : null}
            />
          </SortableContext>
        </DndContext>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={!isLessonsLoading && selectedTopicLessons.length > 0 ? selectedTopicLessons.map((lesson) => lesson._id) : []}
            strategy={verticalListSortingStrategy}
          >
            <LessonsRoadmap
              selectedTopic={{ ...selectedTopic, lessons: selectedTopicLessons }}
              onLessonUpdate={handleLessonUpdate}
              onLessonsChange={handleLessonsChange}
              isLoading={isLessonsLoading}
              isReordering={isLessonsReordering}
            />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
