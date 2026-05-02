'use client'

import { AdminPageShell } from "@/components/common/shared/AdminPageShell";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

interface CommonErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  message?: string;
}

export function CommonError({
  error,
  reset,
  message = "Hệ thống không thể tải dữ liệu lúc này. Vui lòng thử lại sau."
}: CommonErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminPageShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Đã xảy ra lỗi!</h2>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">
            {message}
          </p>
        </div>
        <Button 
          onClick={() => reset()} 
          className="rounded-2xl px-8 h-12 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Thử lại ngay
        </Button>
      </div>
    </AdminPageShell>
  );
}
