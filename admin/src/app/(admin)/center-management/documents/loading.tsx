import { AdminPageShell } from "@/components/common/shared/AdminPageShell";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <AdminPageShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <Loader2 className="w-8 h-8 text-blue-600 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">
          Đang tải dữ liệu tài liệu...
        </p>
      </div>
    </AdminPageShell>
  );
}
