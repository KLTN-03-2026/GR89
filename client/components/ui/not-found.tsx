import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NotFoundProps {
  title?: string;
  message?: string;
  showSearch?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export function NotFound({
  title = "Không tìm thấy trang",
  message = "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.",
  showSearch = true,
  showHome = true,
  showBack = true,
  onBack
}: NotFoundProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* 404 Icon */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Search className="w-16 h-16 text-blue-600" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">4</span>
          </div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">4</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBack && (
            <Button onClick={handleBack} variant="outline" className="flex-1 sm:flex-none">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          )}
          {showHome && (
            <Button onClick={handleHome} className="flex-1 sm:flex-none">
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Button>
          )}
        </div>

        {/* Search suggestion */}
        {showSearch && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Thử tìm kiếm hoặc sử dụng menu điều hướng
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 