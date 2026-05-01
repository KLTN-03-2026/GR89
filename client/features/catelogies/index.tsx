'use client'

import { useState, useMemo } from "react";
import { CategoryType, IClass, IDocument } from "./types";
import { MOCK_CLASSES } from "./mockData";
import { CategoryHeader } from "./components/CategoryHeader";
import { ClassCard } from "./components/ClassCard";
import { DocumentDetailDialog } from "./components/DocumentDetailDialog";
import { ClassPasswordDialog } from "./components/ClassPasswordDialog";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface CategoryContainerProps {
  type: CategoryType;
}

export function CategoryContainer({ type }: CategoryContainerProps) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const classes = useMemo(() => {
    return MOCK_CLASSES.filter(c => c.category === type);
  }, [type]);

  const handleClassClick = (classItem: IClass) => {
    setSelectedClass(classItem);
    setIsPasswordOpen(true);
  };

  const handlePasswordSuccess = (id: string) => {
    setIsPasswordOpen(false);
    if (selectedClass) {
      router.push(`/catelogy/${selectedClass.category}/${id}`);
    }
  };

  const handleViewDocument = (doc: IDocument) => {
    setSelectedDoc(doc);
    setIsDialogOpen(true);
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

  return (
    <div className="space-y-10 pb-20">
      <CategoryHeader type={type} />

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {classes.map((classItem) => (
            <motion.div key={classItem.id} variants={item}>
              <ClassCard
                classItem={classItem}
                onClick={handleClassClick}
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

      <DocumentDetailDialog
        document={selectedDoc}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
