'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotification } from '@/libs/contexts/NotificationProvider'
import { Bell, Check, CheckCheck, Clock, BookOpen, MessageCircle, ArrowLeft, Settings, Search, MoreVertical, Trash2, LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NotificationType = 'system' | 'support' | 'homework' | 'payment' | 'media' | 'lesson'
type NotificationPriority = 'high' | 'medium' | 'low'

export function NotificationsPage() {
  const router = useRouter()
  const { items, unreadCount, refresh, markRead, markAllRead, deleteOne } = useNotification()

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const typeLabels: Record<NotificationType, string> = {
    support: 'Hỗ trợ',
    homework: 'Bài tập',
    lesson: 'Bài học',
    payment: 'Thanh toán',
    media: 'Media',
    system: 'Hệ thống',
  }

  const priorityColors: Record<NotificationPriority, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  }

  const typeMeta: Record<
    NotificationType,
    { icon: LucideIcon;  color: string; bgColor: string; priority: NotificationPriority }
  > = {
    support: { icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-100', priority: 'high' },
    homework: { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100', priority: 'high' },
    lesson: { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100', priority: 'medium' },
    payment: { icon: Settings, color: 'text-purple-600', bgColor: 'bg-purple-100', priority: 'high' },
    media: { icon: Settings, color: 'text-orange-600', bgColor: 'bg-orange-100', priority: 'medium' },
    system: { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', priority: 'low' },
  }

  const getTypeLabel = (type: NotificationType) => typeLabels[type] || 'Hệ thống'
  const getPriorityColor = (priority: NotificationPriority) => priorityColors[priority] || priorityColors.low

  const formatTime = (iso: string) => {
    const t = new Date(iso).getTime()
    if (!Number.isFinite(t)) return ''
    const diff = Date.now() - t
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Vừa xong'
    if (min < 60) return `${min} phút trước`
    const hour = Math.floor(min / 60)
    if (hour < 24) return `${hour} giờ trước`
    const day = Math.floor(hour / 24)
    return `${day} ngày trước`
  }

  useEffect(() => {
    setIsLoading(true)
    refresh().finally(() => setIsLoading(false))
  }, [refresh])

  const filteredNotifications = useMemo(() => {
    return items.filter((n) => {
      const matchesFilter =
        filter === 'all' || (filter === 'unread' && !n.isRead) || (filter === 'read' && n.isRead)
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        q === '' || n.title.toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [items, filter, searchQuery])

  const markAsRead = async (id: string) => {
    await markRead(id)
  }

  const markAllAsRead = async () => {
    await markAllRead()
  }

  const deleteNotification = async (id: string) => {
    await deleteOne(id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                  <p className="text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="bg-white/50 backdrop-blur-sm"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Đọc tất cả
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="bg-white/70 backdrop-blur-sm"
            >
              Tất cả ({items.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="bg-white/70 backdrop-blur-sm"
            >
              Chưa đọc ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
              className="bg-white/70 backdrop-blur-sm"
            >
              Đã đọc ({items.length - unreadCount})
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-16 text-center">
                <div className="text-gray-600">Đang tải thông báo...</div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Không có thông báo</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {filter === 'unread'
                    ? 'Tất cả thông báo đã được đọc. Bạn sẽ nhận được thông báo mới khi có hoạt động.'
                    : searchQuery
                      ? 'Không tìm thấy thông báo nào phù hợp với từ khóa của bạn.'
                      : 'Chưa có thông báo nào.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                    Xóa bộ lọc tìm kiếm
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const meta = typeMeta[notification.type] || typeMeta.system
              const IconComponent = meta.icon
              return (
                <Card
                  key={notification._id}
                  className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    !notification.isRead
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-white shadow-lg'
                      : 'bg-white/70 backdrop-blur-sm border-gray-200'
                  }`}
                  onClick={() => {
                    console.log(notification)
                    if (!notification.link) return
                    if (!notification.isRead) {
                      markAsRead(notification._id).finally(() => router.push(notification.link!))
                      return
                    }
                    router.push(notification.link)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${meta.bgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <IconComponent className={`w-6 h-6 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-semibold text-lg ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />}
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{notification.body}</p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(notification.createdAt)}
                              </span>
                              <Badge variant="secondary" className={`text-xs ${getPriorityColor(meta.priority)}`}>
                                {getTypeLabel(notification.type)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {meta.priority === 'high' ? 'Quan trọng' : meta.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification._id)
                                }}
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Đánh dấu đã đọc"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification._id)
                              }}
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                              title="Xóa thông báo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              title="Thêm tùy chọn"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
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
      </div>

      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 ActiveLearning. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
