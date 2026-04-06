'use client'

import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function EntertainmentVipBanner() {
  return (
    <div className="mt-10 p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
      <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <Play className="h-64 w-64 -rotate-12" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left space-y-3">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1">Đặc quyền VIP</Badge>
          <h4 className="font-extrabold text-2xl md:text-3xl leading-tight">Mở khóa toàn bộ kho tàng giải trí học thuật</h4>
          <p className="text-blue-100 text-sm md:text-base max-w-xl">Học tiếng Anh qua hàng ngàn bộ phim, bản nhạc và podcast có bản quyền với phụ lục chi tiết.</p>
        </div>
        <Button size="lg" variant="secondary" className="rounded-full px-10 py-7 font-extrabold text-blue-700 bg-white hover:bg-blue-50 shadow-xl shadow-black/10 active:scale-95 transition-all flex-shrink-0">
          Nâng cấp tài khoản ngay
        </Button>
      </div>
    </div>
  )
}
