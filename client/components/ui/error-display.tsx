import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  code?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  variant?: 'default' | 'minimal' | 'detailed';
}

export function ErrorDisplay({
  title = "Đã xảy ra lỗi",
  message = "Có vẻ như đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
  code,
  showRetry = true,
  showHome = true,
  showBack = true,
  onRetry,
  onBack,
  variant = 'default'
}: ErrorDisplayProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

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

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{message}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            {showRetry && (
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            )}
            {showBack && (
              <Button onClick={handleBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {code && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-mono text-gray-700">Error Code: {code}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              {showRetry && (
                <Button onClick={handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
              )}
              {showBack && (
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              )}
              {showHome && (
                <Button onClick={handleHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Trang chủ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center justify-center min-h-[300px] p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{message}</p>
          {code && (
            <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
              {code}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && (
            <Button onClick={handleRetry} className="flex-1 sm:flex-none">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          )}
          {showBack && (
            <Button onClick={handleBack} variant="outline" className="flex-1 sm:flex-none">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          )}
          {showHome && (
            <Button onClick={handleHome} variant="outline" className="flex-1 sm:flex-none">
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 