"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { IPATopic, IPALesson } from '../types'
import TopicHeader from './TopicHeader'
import RoadmapSection from './RoadmapSection'
import LessonDetailDialog from './LessonDetailDialog'
import DecorativeBackground from './DecorativeBackground'

interface RoadmapContentProps {
  roadmapData: IPATopic[]
}

export default function RoadmapContent({ roadmapData }: RoadmapContentProps) {
  const [selectedLesson, setSelectedLesson] = useState<IPALesson | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Xác định trạng thái topic dựa trên topic trước đó
  const getTopicStatus = (topic: IPATopic, index: number): IPATopic['status'] => {
    if (index === 0) return topic.status
    const previousTopic = roadmapData[index - 1]
    if (previousTopic.status !== 'completed') return 'locked'
    return topic.status
  }

  // Mở dialog chi tiết khi click vào bài học
  const handleLessonClick = (lesson: IPALesson) => {
    if (lesson.isUnlocked) {
      setSelectedLesson(lesson)
      setIsDialogOpen(true)
    }
  }

  // Tìm topic chứa bài học (để hiển thị trong dialog)
  const getTopicForLesson = (lesson: IPALesson): IPATopic | null => {
    return roadmapData.find(t => t.lessons.some(l => l._id === lesson._id)) || null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <DecorativeBackground />

      <div className="max-w-md mx-auto px-4 py-8 relative z-10">
        <div className="space-y-12 pb-8">
          {roadmapData.map((topic, topicIndex) => {
            const topicStatus = getTopicStatus(topic, topicIndex)
            const isLocked = topicStatus === 'locked'
            const isCompleted = topicStatus === 'completed'

            return (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topicIndex * 0.2 }}
                className="space-y-6"
              >
                <TopicHeader
                  isLocked={isLocked}
                  isCompleted={isCompleted}
                  topic={{
                    unitNumber: topicIndex + 1,
                    title: topic.title,
                    description: topic.description,
                    icon: topic.icon || '📚',
                    progress: topic.progress
                  }}
                />

                {/* Chỉ hiện bài học khi topic chưa bị khóa */}
                {!isLocked && (
                  <RoadmapSection
                    lessons={topic.lessons}
                    onLessonClick={handleLessonClick}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Dialog xem chi tiết bài học */}
      <LessonDetailDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedLesson={selectedLesson}
        topic={selectedLesson ? getTopicForLesson(selectedLesson) : null}
      />
    </div>
  )
}
