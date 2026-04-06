'use client'

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SheetAddTopic } from './SheetAddTopic';
import { useState } from "react";
import { PageHeader } from "@/components/common";

export default function HeaderRoamap() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between mb-8 px-8 py-6 bg-white border-b border-gray-100">
        <PageHeader
          title="Lộ Trình Học Tập"
          subtitle="Thiết kế và quản lý cấu trúc chương trình khóa học"
        />

        <Button
          className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all font-bold gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Chặng Mới</span>
        </Button>
      </header>

      <SheetAddTopic
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
