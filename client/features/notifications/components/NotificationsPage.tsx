'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useNotification } from '@/libs/contexts/NotificationProvider'
import { Bell, Check, CheckCheck, Clock, BookOpen, MessageCircle, ArrowLeft, Settings, Search, MoreVertical, Trash2, LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { respondCenterClassInvite } from '@/features/catelogies/services/api'

type NotificationType = 'system' | 'support' | 'homework' | 'payment' | 'media' | 'lesson'
type NotificationPriority = 'high' | 'medium' | 'low'

export function NotificationsPage() {
  const router = useRouter()
  const { items, unreadCount, refresh, markRead, markAllRead, deleteOne } = useNotification()

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [isActing, setIsActing] = useState(false)

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
    setIsFetching(true)
    refresh().finally(() => setIsFetching(false))
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

  const respondInvite = async (params: { notificationId: string; inviteId: string; classId: string; classCategory: string; accepted: boolean }) => {
    setIsActing(true)
    try {
      await respondCenterClassInvite(params.inviteId, params.accepted)
      if (!items.find((n) => n._id === params.notificationId)?.isRead) {
        await markRead(params.notificationId)
      }
      await refresh()

      if (params.accepted) {
        toast.success('Bạn đã tham gia lớp học')
        router.push(`/catelogy/${params.classCategory}/${params.classId}`)
      } else {
        toast.info('Bạn đã từ chối lời mời')
      }
    } catch {
    } finally {
      setIsActing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-600 hover:bg-slate-100 shrink-0"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </Button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                      Thông báo
                    </h1>
                    {unreadCount > 0 ? (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 text-xs font-black">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {unreadCount > 0 ? 'Bạn có thông báo mới cần xem' : 'Tất cả đã được đọc'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || isFetching || isActing}
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Đọc tất cả
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm thông báo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 pl-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                    disabled={isFetching || isActing}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    className={filter === 'all' ? 'rounded-xl' : 'rounded-xl bg-white'}
                    onClick={() => setFilter('all')}
                    disabled={isFetching || isActing}
                  >
                    Tất cả
                    <span className="ml-2 text-xs font-black opacity-80">{items.length}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    className={filter === 'unread' ? 'rounded-xl' : 'rounded-xl bg-white'}
                    onClick={() => setFilter('unread')}
                    disabled={isFetching || isActing}
                  >
                    Chưa đọc
                    <span className="ml-2 text-xs font-black opacity-80">{unreadCount}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'read' ? 'default' : 'outline'}
                    className={filter === 'read' ? 'rounded-xl' : 'rounded-xl bg-white'}
                    onClick={() => setFilter('read')}
                    disabled={isFetching || isActing}
                  >
                    Đã đọc
                    <span className="ml-2 text-xs font-black opacity-80">{Math.max(0, items.length - unreadCount)}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-slate-100" />
                        <div className="h-3 w-2/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                      <div className="h-9 w-9 rounded-xl bg-slate-100" />
                    </div>
                  </div>
                ))
              ) : filteredNotifications.length === 0 ? (
                <div className="p-10 sm:p-14 text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <Bell className="h-7 w-7" />
                  </div>
                  <div className="mt-4 text-lg font-black text-slate-900">Không có thông báo</div>
                  <div className="mt-1 text-sm font-medium text-slate-500">
                    {filter === 'unread'
                      ? 'Tất cả thông báo đã được đọc.'
                      : searchQuery
                        ? 'Không tìm thấy thông báo nào phù hợp.'
                        : 'Chưa có thông báo nào.'}
                  </div>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      className="mt-4 rounded-xl"
                      onClick={() => setSearchQuery('')}
                    >
                      Xóa tìm kiếm
                    </Button>
                  ) : null}
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const meta = typeMeta[notification.type] || typeMeta.system
                  const IconComponent = meta.icon
                  const invite = notification?.data?.action === 'center_class_invite'
                    ? {
                      inviteId: String(notification?.data?.inviteId || ''),
                      classId: String(notification?.data?.classId || ''),
                      classCategory: String(notification?.data?.classCategory || ''),
                      className: String(notification?.data?.className || ''),
                    }
                    : null

                  const canRespondInvite =
                    !!invite?.inviteId && !!invite?.classId && !!invite?.classCategory && !notification.isRead

                  return (
                    <div
                      key={notification._id}
                      className={[
                        'p-4 sm:p-6 transition-colors',
                        invite ? '' : 'cursor-pointer hover:bg-slate-50',
                        !notification.isRead ? 'bg-blue-50/30' : 'bg-white',
                      ].join(' ')}
                      onClick={() => {
                        if (invite) return
                        if (!notification.link) return
                        if (!notification.isRead) {
                          markAsRead(notification._id).finally(() => router.push(notification.link!))
                          return
                        }
                        router.push(notification.link)
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-2xl ${meta.bgColor} flex items-center justify-center shrink-0`}>
                          <IconComponent className={`h-5 w-5 ${meta.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="truncate font-black text-slate-900">
                                  {notification.title}
                                </div>
                                {!notification.isRead ? (
                                  <span className="shrink-0 h-2 w-2 rounded-full bg-blue-600" />
                                ) : null}
                              </div>
                              <div className="mt-1 text-sm font-medium text-slate-600 line-clamp-2">
                                {notification.body}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(notification.createdAt)}
                              </div>

                              {!invite && !notification.isRead ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification._id)
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              ) : null}

                              {!invite ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification._id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification._id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:bg-slate-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className={`text-[11px] ${getPriorityColor(meta.priority)}`}>
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <Badge variant="outline" className="text-[11px]">
                              {meta.priority === 'high' ? 'Quan trọng' : meta.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </Badge>
                            <span className="sm:hidden text-[11px] font-semibold text-slate-500">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>

                          {invite ? (
                            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-blue-800 truncate">
                                    {invite.className ? `Lớp: ${invite.className}` : 'Lớp: —'}
                                  </div>
                                  <div className="mt-1 text-xs font-semibold text-blue-700/80">
                                    {notification.isRead ? 'Đã xử lý' : 'Vui lòng xác nhận để tham gia lớp học.'}
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-white text-blue-700 border border-blue-100 text-[11px] font-black">
                                  Lời mời
                                </Badge>
                              </div>

                              {canRespondInvite ? (
                                <div className="mt-4 flex flex-wrap gap-3">
                                  <Button
                                    variant="outline"
                                    className="rounded-xl border-slate-200 bg-white"
                                    disabled={isActing}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      respondInvite({
                                        notificationId: notification._id,
                                        inviteId: invite.inviteId,
                                        classId: invite.classId,
                                        classCategory: invite.classCategory,
                                        accepted: false,
                                      })
                                    }}
                                  >
                                    Từ chối
                                  </Button>
                                  <Button
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700"
                                    disabled={isActing}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      respondInvite({
                                        notificationId: notification._id,
                                        inviteId: invite.inviteId,
                                        classId: invite.classId,
                                        classCategory: invite.classCategory,
                                        accepted: true,
                                      })
                                    }}
                                  >
                                    Tham gia lớp
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
