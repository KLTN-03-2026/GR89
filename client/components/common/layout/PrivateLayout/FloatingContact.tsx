'use client'

import { MessageCircleMore } from 'lucide-react'
import Image from 'next/image'

export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-4">
      
      {/* Messenger */}
      <a
        href="http://m.me/tennick"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center"
      >
        <div className="absolute left-16 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 bg-black text-white text-sm px-3 py-2 rounded-xl whitespace-nowrap shadow-lg">
          Chat Facebook
        </div>

        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl border border-gray-200 hover:scale-110 transition duration-300">
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping"></span>

          <Image
            src="https://cdn.jsdelivr.net/gh/doannguyennet/images/fbmessenger.svg"
            alt="Messenger"
            width={24}
            height={24}
            className="w-8 h-8 relative z-10"
          />
        </div>
      </a>

      {/* Zalo */}
      <a
        href="https://zalo.me/19008198"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center"
      >
        <div className="absolute left-16 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 bg-black text-white text-sm px-3 py-2 rounded-xl whitespace-nowrap shadow-lg">
          Chat Zalo
        </div>

        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl border border-gray-200 hover:scale-110 transition duration-300">
          <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-20 animate-ping"></span>

          <Image
            src="https://cdn.jsdelivr.net/gh/doannguyennet/images/zalo.svg"
            alt="Zalo"
            width={24}
            height={24}
            className="w-8 h-8 relative z-10"
          />
        </div>
      </a>

      {/* Nút hỗ trợ */}
      <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-2xl animate-bounce">
        <MessageCircleMore size={18} />
        <span className="text-sm font-medium">
          Hỗ trợ trực tuyến
        </span>
      </div>
    </div>
  )
}