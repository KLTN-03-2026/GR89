'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  User as UserIcon,
  Mail,
  Trophy,
  Zap,
  Clock,
  BookOpen,
  FileText,
  Eye,
  Headphones,
  Mic,
  PenTool,
  Activity,
  Calendar,
  ShieldCheck,
  Loader2,
  TrendingUp
} from "lucide-react"
import { getUserScoreById } from "../../services/api"
import { User, UserScore } from "../../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface SheetViewUserDetailProps {
  user: User
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}

export function SheetViewUserDetail({ user, isOpen, setIsOpen }: SheetViewUserDetailProps) {
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<UserScore | null>(null)

  useEffect(() => {
    if (isOpen) {
      const fetchScore = async () => {
        setLoading(true)
        try {
          const res = await getUserScoreById(user._id)
          if (res.success && res.data) setScore(res.data)
        } finally {
          setLoading(false)
        }
      }
      fetchScore()
    }
  }, [isOpen, user])

  const skillScores = [
    { label: 'Từ Vựng', value: score?.vocabularyPoints ?? 0, icon: BookOpen, color: 'text-rose-500', bgColor: 'bg-rose-50' },
    { label: 'Ngữ Pháp', value: score?.grammarPoints ?? 0, icon: FileText, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { label: 'Đọc Hiểu', value: score?.readingPoints ?? 0, icon: Eye, color: 'text-cyan-500', bgColor: 'bg-cyan-50' },
    { label: 'Nghe Hiểu', value: score?.listeningPoints ?? 0, icon: Headphones, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: 'Luyện Nói', value: score?.speakingPoints ?? 0, icon: Mic, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { label: 'Luyện Viết', value: score?.writingPoints ?? 0, icon: PenTool, color: 'text-violet-500', bgColor: 'bg-violet-50' },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="h-full sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">{user.fullName}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-bold uppercase text-[10px]">
                  {user.role}
                </Badge>
                <span className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> {user.email}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Section: Overall Stats */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <TrendingUp className="w-4 h-4" />
                Tổng Quan Tiến Độ
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 opacity-20" />
                  <p className="text-[10px] font-black text-gray-400 uppercase mt-4 tracking-widest">Đang tải dữ liệu điểm số...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-amber-50/50 p-5 rounded-[2rem] border border-amber-100/50 text-center space-y-1 shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-2 shadow-sm">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-amber-900 tracking-tight">{(score?.totalPoints ?? user.totalPoints ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-wider">Tổng Điểm</p>
                  </div>

                  <div className="bg-rose-50/50 p-5 rounded-[2rem] border border-rose-100/50 text-center space-y-1 shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-2 shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-rose-900 tracking-tight">{score?.currentStreak ?? user.currentStreak ?? 0}</p>
                    <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-wider">Chuỗi Ngày</p>
                  </div>

                  <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100/50 text-center space-y-1 shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-2 shadow-sm">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-indigo-900 tracking-tight">{score?.longestStreak ?? user.longestStreak ?? 0}</p>
                    <p className="text-[10px] font-black text-indigo-600/70 uppercase tracking-wider">Kỷ Lục</p>
                  </div>

                  <div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100/50 text-center space-y-1 shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-2 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-emerald-900 tracking-tight">{score?.totalStudyTime ?? user.totalStudyTime ?? 0}</p>
                    <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-wider">Giờ Học</p>
                  </div>
                </div>
              )}
            </section>

            {/* Section: Skill Breakdown */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <ShieldCheck className="w-4 h-4" />
                Chi Tiết Kỹ Năng
              </div>

              <div className="grid grid-cols-2 gap-4">
                {skillScores.map((skill) => (
                  <div key={skill.label} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm group hover:bg-white hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${skill.bgColor} ${skill.color} shadow-inner`}>
                        <skill.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{skill.label}</span>
                    </div>
                    <span className={`text-lg font-black ${skill.color} tracking-tight`}>{skill.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: System Info */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-slate-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Activity className="w-4 h-4" />
                Thông Tin Hệ Thống
              </div>

              <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" /> Ngày tham gia
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi }) : '---'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> Đăng nhập cuối
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {user.lastActiveDate ? format(new Date(user.lastActiveDate), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'Chưa từng đăng nhập'}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end w-full">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="h-12 px-10 rounded-2xl border-gray-200 font-black text-gray-600 hover:bg-white transition-all active:scale-95"
              >
                Đóng Cửa Sổ
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
