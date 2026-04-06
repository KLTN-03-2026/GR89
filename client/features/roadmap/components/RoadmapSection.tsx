import type { IPALesson, IPALessonGroup } from '../types'
import { GROUP_THRESHOLD } from '../services/constants'
import ConnectionLine from './ConnectionLine'
import SingleLessonNode from './SingleLessonNode'
import GroupedLessonNode from './GroupedLessonNode'
import RewardNode from './RewardNode'

interface RoadmapSectionProps {
  lessons: IPALesson[]
  onLessonClick: (lesson: IPALesson) => void
}

// Gom các bài liên tiếp cùng type thành nhóm
function groupConsecutiveLessons(lessons: IPALesson[]): IPALessonGroup[] {
  const groups: IPALessonGroup[] = []
  let i = 0
  while (i < lessons.length) {
    const currentType = lessons[i].type
    const startIndex = i
    const groupLessons: IPALesson[] = []
    while (i < lessons.length && lessons[i].type === currentType) {
      groupLessons.push(lessons[i])
      i++
    }
    groups.push({ type: currentType, lessons: groupLessons, startIndex })
  }
  return groups
}

export default function RoadmapSection({ lessons, onLessonClick }: RoadmapSectionProps) {
  const groups = groupConsecutiveLessons(lessons)

  return (
    <div className="space-y-6">
      {/* Đường nối từ header topic xuống bài đầu tiên */}
      <ConnectionLine height="h-8" />

      {groups.map((group, groupIndex) => {
        // Gom nhóm khi >= GROUP_THRESHOLD bài cùng type (trừ review)
        const isGrouped = group.lessons.length >= GROUP_THRESHOLD && group.type !== 'review'

        return (
          <div key={`group-${groupIndex}`}>
            {/* Đường nối giữa các nhóm */}
            {groupIndex > 0 && (
              <div className="mb-6">
                <ConnectionLine />
              </div>
            )}

            {isGrouped ? (
              // Hiển thị 1 node đại diện cho cả nhóm
              <GroupedLessonNode
                group={group as IPALessonGroup}
                allLessons={lessons}
                animationDelay={groupIndex * 0.15}
                onLessonClick={onLessonClick}
              />
            ) : (
              // Hiển thị từng bài riêng lẻ
              group.lessons.map((lesson, i) => (
                <div key={lesson._id}>
                  {i > 0 && (
                    <div className="my-4">
                      <ConnectionLine />
                    </div>
                  )}
                  <SingleLessonNode
                    lesson={lesson}
                    globalIndex={group.startIndex + i}
                    allLessons={lessons}
                    animationDelay={groupIndex * 0.15 + i * 0.1}
                    onLessonClick={onLessonClick}
                  />
                </div>
              ))
            )}
          </div>
        )
      })}

      {/* Node phần thưởng cuối topic */}
      <RewardNode delay={groups.length * 0.15} />
    </div>
  )
}
