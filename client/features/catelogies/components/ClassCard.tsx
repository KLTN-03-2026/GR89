'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, User, ArrowRight, BookOpen, Clock } from "lucide-react";
import { IClass } from "../types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface ClassCardProps {
  classItem: IClass;
  onClick: (classItem: IClass) => void;
}

export function ClassCard({ classItem, onClick }: ClassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all cursor-pointer group bg-white" 
        onClick={() => onClick(classItem)}
      >
        <CardHeader className="p-6 pb-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 font-bold">
              {classItem.level}
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {classItem.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5" />
              GV: {classItem.teacherName}
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                Khai giảng
              </div>
              <p className="text-sm font-bold text-gray-900">{classItem.startDate}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Lịch học
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">{classItem.schedule}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm py-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-600 font-bold">{classItem.studentCount}</span>
              <span className="text-gray-400">Học viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-gray-600 font-bold">{classItem.lessonCount}</span>
              <span className="text-gray-400">Tài liệu</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-4">
          <Button className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-6 rounded-2xl transition-all group/btn shadow-lg shadow-gray-200">
            Vào lớp học
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
