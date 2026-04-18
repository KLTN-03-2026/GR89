'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, CheckCheck, Clock, Star, Trophy, BookOpen, MessageCircle, ArrowLeft, Settings, Search, MoreVertical, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NotificationsPage() {
  type NotificationType = 'achievement' | 'lesson' | 'reminder' | 'message' | 'system'
  type NotificationPriority = 'high' | 'medium' | 'low'
  interface NotificationItem {
    id: number
    type: NotificationType
    title: string
    description: string
    time: string
    isRead: boolean
    icon: LucideIcon
    color: string
    bgColor: string
    priority: NotificationPriority
  }

  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const notifications: NotificationItem[] = [
    { id: 1, type: 'achievement', title: 'Chúc mừng! Bạn đã hoàn thành bài học Grammar cơ bản', description: 'Bạn đã hoàn thành 10/10 bài học trong chủ đề "Present Simple". Hãy tiếp tục với chủ đề tiếp theo!', time: '2 phút trước', isRead: false, icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-100', priority: 'high' },
    { id: 2, type: 'lesson', title: 'Bài học mới: Advanced Vocabulary', description: 'Chủ đề "Business English" đã được thêm vào lộ trình học của bạn. Hãy khám phá ngay!', time: '1 giờ trước', isRead: false, icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100', priority: 'medium' },
    { id: 3, type: 'reminder', title: 'Nhắc nhở học tập hàng ngày', description: 'Đã đến lúc học bài! Hãy tiếp tục hành trình học tiếng Anh của bạn để duy trì streak.', time: '3 giờ trước', isRead: true, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100', priority: 'low' },
    { id: 4, type: 'message', title: 'Tin nhắn từ giáo viên Sarah', description: 'Cô Sarah đã gửi phản hồi chi tiết về bài viết của bạn. Hãy xem ngay!', time: '5 giờ trước', isRead: true, icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-100', priority: 'high' },
    { id: 5, type: 'achievement', title: 'Streak 7 ngày liên tiếp! 🔥', description: 'Bạn đã học liên tục 7 ngày. Hãy tiếp tục duy trì streak để nhận phần thưởng đặc biệt!', time: '1 ngày trước', isRead: true, icon: Star, color: 'text-purple-600', bgColor: 'bg-purple-100', priority: 'high' },
    { id: 6, type: 'system', title: 'Cập nhật hệ thống mới', description: 'Chúng tôi đã cải thiện giao diện AI Assistant với nhiều tính năng mới. Hãy thử trải nghiệm!', time: '2 ngày trước', isRead: true, icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', priority: 'low' },
  ]

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || (filter === 'unread' && !n.isRead) || (filter === 'read' && n.isRead)
    const matchesSearch = searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const markAsRead = (id: number) => { return id }
  const markAllAsRead = () => { return }
  const deleteNotification = (id: number) => { return id }

  const typeLabels: Record<NotificationType, string> = {
    achievement: 'Thành tích',
    lesson: 'Bài học',
    reminder: 'Nhắc nhở',
    message: 'Tin nhắn',
    system: 'Hệ thống'
  }
  const priorityColors: Record<NotificationPriority, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  }
  const getTypeLabel = (type: NotificationType) => typeLabels[type]
  const getPriorityColor = (priority: NotificationPriority) => priorityColors[priority]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:bg-gray-100"><ArrowLeft className="w-5 h-5 mr-2" />Quay lại</Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"><Bell className="w-6 h-6 text-white" /></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                  <p className="text-gray-600">{unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="bg-white/50 backdrop-blur-sm"><CheckCheck className="w-4 h-4 mr-2" />Đọc tất cả</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Tìm kiếm thông báo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="bg-white/70 backdrop-blur-sm">Tất cả ({notifications.length})</Button>
            <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')} className="bg-white/70 backdrop-blur-sm">Chưa đọc ({unreadCount})</Button>
            <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('read')} className="bg-white/70 backdrop-blur-sm">Đã đọc ({notifications.length - unreadCount})</Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><Bell className="w-10 h-10 text-gray-400" /></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Không có thông báo</h3>
                <p className="text-gray-600 max-w-md mx-auto">{filter === 'unread' ? 'Tất cả thông báo đã được đọc. Bạn sẽ nhận được thông báo mới khi có hoạt động.' : searchQuery ? 'Không tìm thấy thông báo nào phù hợp với từ khóa của bạn.' : 'Chưa có thông báo nào. Hãy bắt đầu học để nhận thông báo!'}</p>
                {searchQuery && (<Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">Xóa bộ lọc tìm kiếm</Button>)}
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = notification.icon
              return (
                <Card key={notification.id} className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${!notification.isRead ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-white shadow-lg' : 'bg-white/70 backdrop-blur-sm border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${notification.bgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <IconComponent className={`w-6 h-6 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-semibold text-lg ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</h3>
                              {!notification.isRead && (<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>)}
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{notification.description}</p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" />{notification.time}</span>
                              <Badge variant="secondary" className={`text-xs ${getPriorityColor(notification.priority)}`}>{getTypeLabel(notification.type)}</Badge>
                              <Badge variant="outline" className="text-xs">{notification.priority === 'high' ? 'Quan trọng' : notification.priority === 'medium' ? 'Trung bình' : 'Thấp'}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.isRead && (<Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="Đánh dấu đã đọc"><Check className="w-4 h-4" /></Button>)}
                            <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)} className="text-gray-500 hover:text-red-600 hover:bg-red-50" title="Xóa thông báo"><Trash2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="Thêm tùy chọn"><MoreVertical className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="bg-white/70 backdrop-blur-sm hover:bg-white/90">Tải thêm thông báo</Button>
          </div>
        )}
      </div>

      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600"><p>&copy; 2026 EnglishMaster. Tất cả quyền được bảo lưu.</p></div>
        </div>
      </div>
    </div>
  )
}


