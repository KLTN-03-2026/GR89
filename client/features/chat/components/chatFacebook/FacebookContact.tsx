'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/libs/utils'

interface FacebookContactProps {
  floating?: boolean
  className?: string
}

export function FacebookContact({ floating = true, className }: FacebookContactProps) {
  return (
    <Link
      href="http://m.me/lam.thanh.543869"
      target="_blank"
      rel="noreferrer"
      className={cn('group relative', floating && 'fixed bottom-52 right-6 z-50', className)}
      aria-label="Chat Facebook"
    >
      <div className="relative rounded-full bg-white shadow-xl border-2 border-white ring-1 ring-black/5 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
        <Image
          src="https://cdn.jsdelivr.net/gh/doannguyennet/images/fbmessenger.svg"
          alt="Messenger"
          width={24}
          height={24}
          className="h-16 w-16"
        />
      </div>

      <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-white" />

      <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-2 w-max">
        <Image
          src="https://cdn.jsdelivr.net/gh/doannguyennet/images/fbmessenger.svg"
          alt="Messenger"
          width={32}
          height={32}
        />
        <span className="font-semibold">Chat Facebook</span>
      </div>
    </Link>
  )
}
