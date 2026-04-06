'use client'

import { Button } from "@/components/ui/button";
import { useAuth } from "@/libs/contexts/AuthContext";
import { headerMainLayoutData } from "@/mock/data";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AvatarDrowdown from "./AvatarDrowdown";
import { Skeleton } from "@/components/ui/skeleton";

export function MainHeader() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const handleLogin = () => {
    router.push('/login')
  }
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src={headerMainLayoutData.logo} alt="logo" width={36} height={36} className="rounded" />
            <span className="text-lg font-semibold text-gray-900 hidden sm:block">
              {headerMainLayoutData.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  className="rounded-full text-white hover:shadow-sm transition-transform hover:scale-[1.02]"
                  onClick={() => router.push('/dashboard')}
                >
                  Bắt đầu học <ArrowRight />
                </Button>
                <AvatarDrowdown />
              </>
            ) : isLoading ? (
              // Skeleton loading
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-32 bg-blue-100 rounded-full" />
                <Skeleton className="h-9 w-9 bg-blue-100 rounded-full" />
              </div>
            ) : (
              <Button
                className="rounded-full text-white hover:shadow-sm transition-transform hover:scale-[1.02]"
                onClick={handleLogin}
              >
                Đăng nhập <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header >
  )
}
