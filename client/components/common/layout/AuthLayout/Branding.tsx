import { Award, BookOpen, Globe, Users } from "lucide-react";
import Image from "next/image";

export function Branding() {
  return (
    <>
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Image src="/images/logo.png" alt="logo" width={50} height={50} />

            <h1 className="text-3xl font-bold text-primary">EnglishMaster</h1>
          </div>

          <h2 className="text-4xl font-bold text-primary leading-tight">
            Học tiếng Anh hiệu quả hơn <br />
            mỗi ngày
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Tham gia cộng đồng hơn 100,000 học viên đang cải thiện khả năng tiếng Anh với phương pháp học tập hiện đại
            và tương tác.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Học mọi lúc</h3>
              <p className="text-sm text-gray-600">24/7 trực tuyến</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cộng đồng</h3>
              <p className="text-sm text-gray-600">100K+ học viên</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Chứng chỉ</h3>
              <p className="text-sm text-gray-600">Được công nhận</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bài học</h3>
              <p className="text-sm text-gray-600">1000+ bài học</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
