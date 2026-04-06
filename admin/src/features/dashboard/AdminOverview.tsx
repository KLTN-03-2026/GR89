'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BookOpen,
  Mic,
  PenTool,
  Eye,
  Volume2,
  MessageSquare,
  TrendingUp,
  Award,
  Bookmark,
  DollarSign,
  PlayCircle,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  ArrowRight,
  UserPlus,
  LayoutDashboard
} from 'lucide-react'
import { getAdminDashboardOverview, AdminOverview as AdminOverviewData } from '@/lib/apis/api'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function AdminOverview() {
  const { user } = useAuth()
  const [data, setData] = useState<AdminOverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await getAdminDashboardOverview()
        if (response.success && response.data) {
          setData(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard overview:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !data) {
    return (
      <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-20 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const kpis = [
    {
      title: "Người Dùng",
      value: data.kpis.totalUsers.toLocaleString(),
      change: `${data.kpis.growth.users >= 0 ? '+' : ''}${data.kpis.growth.users}%`,
      icon: Users,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
      hoverBgClass: "group-hover:bg-blue-600",
      description: "Tổng số thành viên đã đăng ký"
    },
    {
      title: "Doanh Thu",
      value: `${data.kpis.totalRevenue.toLocaleString()}đ`,
      change: `${data.kpis.growth.revenue >= 0 ? '+' : ''}${data.kpis.growth.revenue}%`,
      icon: DollarSign,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
      hoverBgClass: "group-hover:bg-emerald-600",
      description: "Tổng thu từ nâng cấp gói VIP"
    },
    {
      title: "Nội Dung",
      value: data.kpis.totalLessons.toLocaleString(),
      change: "Ổn định",
      icon: BookOpen,
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
      hoverBgClass: "group-hover:bg-indigo-600",
      description: "Bài học & chủ đề đã xuất bản"
    },
    {
      title: "Lượt Hoàn Thành",
      value: data.kpis.totalCompletedLessons.toLocaleString(),
      change: "Tăng trưởng",
      icon: CheckCircle,
      colorClass: "text-orange-600",
      bgClass: "bg-orange-50",
      hoverBgClass: "group-hover:bg-orange-600",
      description: "Lượt học viên hoàn thành bài"
    }
  ]

  const skillCards = [
    { title: "Từ vựng", count: data.contentStats.vocabulary, icon: BookOpen, colorClass: "bg-emerald-500", shadowClass: "shadow-emerald-100", textClass: "group-hover:text-emerald-600" },
    { title: "Ngữ pháp", count: data.contentStats.grammar, icon: MessageSquare, colorClass: "bg-amber-500", shadowClass: "shadow-amber-100", textClass: "group-hover:text-amber-600" },
    { title: "Phiên âm IPA", count: data.contentStats.ipa, icon: Mic, colorClass: "bg-violet-500", shadowClass: "shadow-violet-100", textClass: "group-hover:text-violet-600" },
    { title: "Luyện nghe", count: data.contentStats.listening, icon: Volume2, colorClass: "bg-pink-500", shadowClass: "shadow-pink-100", textClass: "group-hover:text-pink-600" },
    { title: "Luyện đọc", count: data.contentStats.reading, icon: Eye, colorClass: "bg-indigo-500", shadowClass: "shadow-indigo-100", textClass: "group-hover:text-indigo-600" },
    { title: "Luyện nói", count: data.contentStats.speaking, icon: Mic, colorClass: "bg-orange-500", shadowClass: "shadow-orange-100", textClass: "group-hover:text-orange-600" },
    { title: "Luyện viết", count: data.contentStats.writing, icon: PenTool, colorClass: "bg-teal-500", shadowClass: "shadow-teal-100", textClass: "group-hover:text-teal-600" },
    { title: "Giải trí", count: data.contentStats.entertainment, icon: PlayCircle, colorClass: "bg-rose-500", shadowClass: "shadow-rose-100", textClass: "group-hover:text-rose-600" }
  ]

  return (
    <div className="p-8 space-y-10 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Chào {user?.fullName?.split(' ').pop() || 'bạn'}, mừng quay lại! 👋
            </h1>
          </div>
          <p className="text-gray-500 font-medium">Hôm nay hệ thống của bạn đang hoạt động rất tốt.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            Lịch sử
          </Button>
          <Button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Tạo bài học mới
          </Button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((card, index) => (
          <Card key={index} className="group relative overflow-hidden rounded-3xl border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <div className={`p-3 rounded-2xl ${card.bgClass} ${card.colorClass} ${card.hoverBgClass} group-hover:text-white transition-colors duration-300`}>
                <card.icon className="w-6 h-6" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-gray-900">{card.value}</div>
              <div className="flex items-center mt-3 gap-2">
                <Badge variant="secondary" className={`px-2 py-0.5 rounded-lg border-none ${card.change.startsWith('+') ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                  }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {card.change}
                </Badge>
                <span className="text-xs font-medium text-gray-400">vs tháng trước</span>
              </div>
              <p className="text-xs font-medium text-gray-400 mt-4 leading-relaxed">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity Card */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Hoạt động mới nhất</CardTitle>
            </div>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-bold">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity, index) => (
                  <div key={index} className="group flex items-start space-x-5 p-4 rounded-3xl hover:bg-gray-50 transition-all duration-200">
                    <div className={`p-4 rounded-2xl shadow-sm ${activity.type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                      activity.type === 'lesson' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {activity.type === 'payment' ? <DollarSign className="w-5 h-5" /> :
                        activity.type === 'lesson' ? <BookOpen className="w-5 h-5" /> :
                          <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {format(new Date(activity.createdAt), 'HH:mm', { locale: vi })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          {format(new Date(activity.createdAt), 'dd MMMM yyyy', { locale: vi })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Hệ thống chưa ghi nhận hoạt động mới</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Users Sidebar Card */}
        <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Người dùng mới</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex-1">
            <div className="space-y-6">
              {data.newUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-2xl transition-all">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Hoạt động" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-400 font-medium truncate">{user.email}</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-10 h-12 rounded-2xl bg-gray-50 text-gray-600 hover:text-blue-600 font-bold transition-all">
              Quản lý tài khoản
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Content Repository Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-2xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Thư Viện Nội Dung</h2>
          </div>
          <Badge className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
            {data.kpis.totalLessons} Tài nguyên
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skillCards.map((skill, index) => (
            <Card key={index} className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-[2rem] border-none bg-white shadow-sm overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-5 rounded-3xl ${skill.colorClass} text-white shadow-xl ${skill.shadowClass} transform group-hover:rotate-12 transition-transform duration-300`}>
                    <skill.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-lg font-black text-gray-900 ${skill.textClass} transition-colors`}>{skill.title}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-gray-900">{skill.count}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mục</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Footer Section */}
      <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full bg-white opacity-[0.05]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black">Lối tắt quản lý</h2>
            <p className="text-blue-100 font-medium max-w-md">Tiết kiệm thời gian với các thao tác nhanh đến các module quan trọng nhất.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="h-14 px-8 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black shadow-lg shadow-black/10 transition-all active:scale-95">
              <Users className="w-5 h-5 mr-3" />
              Người dùng
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-blue-500 text-white hover:bg-blue-400 font-black shadow-lg shadow-black/10 transition-all active:scale-95 border border-blue-400">
              <BookOpen className="w-5 h-5 mr-3" />
              Bài học
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-blue-700 text-white hover:bg-blue-800 font-black shadow-lg shadow-black/10 transition-all active:scale-95">
              <Award className="w-5 h-5 mr-3" />
              Báo cáo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
