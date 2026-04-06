'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { BookOpen, Eye, FileText, GripVertical, Headphones, Mic, PenTool, Target, Trash2 } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AlertDialogConfirmDeleteLesson from './AlertDialogConfirmDeleteLesson'
import Link from 'next/link'
import { RoadmapLesson } from '../../types';

interface CardLessonProps {
  lesson: RoadmapLesson;
  roadmapId: string;
  onLessonUpdate?: (roadmapId: string, lessonId: string, isActive: boolean) => void;
  onLessonsChange?: () => void;
}

const lessonTypeConfig = {
  vocabulary: {
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-pink-400",
  },
  grammar: {
    icon: <FileText className="w-6 h-6" />,
    color: "bg-blue-400",
  },
  ipa: {
    icon: <Mic className="w-6 h-6" />,
    color: "bg-cyan-500",
  },
  listening: {
    icon: <Headphones className="w-6 h-6" />,
    color: "bg-green-400",
  },
  speaking: {
    icon: <Mic className="w-6 h-6" />,
    color: "bg-yellow-400",
  },
  reading: {
    icon: <Eye className="w-6 h-6" />,
    color: "bg-purple-400",
  },
  writing: {
    icon: <PenTool className="w-6 h-6" />,
    color: "bg-orange-400",
  },
  quiz: {
    icon: <Target className="w-6 h-6" />,
    color: "bg-red-400",
  },
  review: {
    icon: <Target className="w-6 h-6" />,
    color: "bg-red-400",
  },
}

const linkTypeConfig = {
  vocabulary: '/content/vocabulary',
  grammar: '/content/grammar',
  ipa: '/content/ipa',
  listening: '/content/listening',
  speaking: '/content/speaking',
  reading: '/content/reading',
  writing: '/content/writing',
  review: '/content/review',
}

export default function CardLesson({ lesson, roadmapId, onLessonsChange }: CardLessonProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    attributes,      // HTML attributes cần thiết (role, tabIndex, etc.)
    listeners,       // Event handlers (onPointerDown, etc.)
    setNodeRef,      // Ref để attach vào DOM element
    transform,       // Transform object {x, y, scaleX, scaleY}
    transition,      // CSS transition string
    isDragging,      // Boolean: item này có đang được kéo không?
  } = useSortable({ id: lesson._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  return (
    <>
      <Card className="py-8" ref={setNodeRef} style={style}>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <GripVertical
              className="text-gray-400 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            />
            <div className={`${lessonTypeConfig[lesson.type].color} text-white w-12 h-12 rounded-lg flex items-center justify-center`}>
              {lessonTypeConfig[lesson.type].icon}
            </div>
            <div>
              <CardTitle className="text-md font-semibold hover:font-italic">
                <Link href={linkTypeConfig[lesson.type as keyof typeof linkTypeConfig]} target="_blank" className="hover:underline">
                  {lesson.title}
                </Link>
              </CardTitle>

              <CardDescription className="text-sm text-gray-500">{lesson.description}</CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            className="border-none p-0 hover:bg-while shadow-none"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </CardContent>
      </Card>

      <AlertDialogConfirmDeleteLesson
        roadmapId={roadmapId}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        lesson={lesson}
        onLessonsChange={onLessonsChange}
      />
    </>
  )
}
