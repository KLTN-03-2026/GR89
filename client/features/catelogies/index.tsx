'use client'

import { useMemo, useState } from "react";
import { CategoryType, IClass } from "./types";
import { CategoryHeader } from "./components/CategoryHeader";
import { ClassCard } from "./components/ClassCard";
import { ClassPasswordDialog } from "./components/ClassPasswordDialog";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { CenterClassStats } from "./types";
import { Users, BookOpen, Clock, Target } from "lucide-react";
import { isUserEnrolledInClass } from "@/features/catelogies/services/api";

interface CategoryContainerProps {
  type: CategoryType;
  classes: IClass[];
  stats?: CenterClassStats;
}

export function CategoryContainer({ type, classes, stats }: CategoryContainerProps) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClassClick = async (classItem: IClass) => {
    setSelectedClass(classItem);
    setIsLoading(true);
    await isUserEnrolledInClass(classItem._id)
      .then(res => {
        if (res.success && res.data) {
          if (classItem) {
            router.push(`/catelogy/${classItem.category}/${classItem._id}`);
          }
        }
        else {
          setIsPasswordOpen(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  const handlePasswordSuccess = () => {
    setIsPasswordOpen(false);
    if (selectedClass) {
      router.push(`/catelogy/${selectedClass.category}/${selectedClass._id}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const statsOverview = useMemo(() => {
    const catStats = stats?.byCategory?.[type];
    if (!catStats) return undefined;

    return [
      {
        title: 'Tổng lớp',
        value: String(catStats.classes),
        change: catStats.classes ? 'Đang cập nhật' : 'Chưa có dữ liệu',
        Icon: BookOpen,
        color: 'from-blue-500 to-blue-400',
      },
      {
        title: 'Tổng học viên',
        value: String(catStats.studentsUnique),
        change: catStats.studentsUnique ? 'Học viên unique' : 'Chưa có dữ liệu',
        Icon: Users,
        color: 'from-purple-500 to-purple-400',
      },
      {
        title: 'Tổng học viên (catelogies)',
        value: String(catStats.studentsEnrollments),
        change: catStats.studentsEnrollments ? `Tổng lượt đăng ký` : 'Chưa có dữ liệu',
        Icon: Target,
        color: 'from-orange-500 to-orange-400',
      },
      {
        title: 'Giảng viên phụ trách',
        value: String(catStats.teachers),
        change: catStats.teachers ? 'Giảng viên được phân công' : 'Chưa có dữ liệu',
        Icon: Clock,
        color: 'from-emerald-500 to-emerald-400',
      },
    ];
  }, [stats, type]);

  return (
    <div className="space-y-10 pb-20">
      <CategoryHeader type={type} statsOverview={statsOverview} />

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách lớp học</h2>
            <p className="mt-2 text-gray-500 font-medium">Chọn một lớp học để xem tài liệu chi tiết</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-600">
            {classes.length} Lớp đang hoạt động
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
        >
          {classes.map((classItem) => (
            <motion.div key={classItem._id} variants={item}>
              <ClassCard
                isLoading={isLoading}
                classItem={classItem}
                onClick={() => handleClassClick(classItem)}
              />
            </motion.div>
          ))}
        </motion.div>

        {classes.length === 0 && (
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lớp học nào</h3>
            <p className="text-gray-500">Chúng tôi đang cập nhật các lớp học mới cho danh mục này. Quay lại sau nhé!</p>
          </div>
        )}
      </div>

      <ClassPasswordDialog
        classItem={selectedClass}
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}
