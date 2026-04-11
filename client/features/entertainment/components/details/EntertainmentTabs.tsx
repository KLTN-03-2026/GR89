'use client'

import { useEffect, useMemo, useState } from 'react'
import { Info, List, MessageSquare, Play, ThumbsUp, Flag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/libs/utils'
import Link from 'next/link'
import Image from 'next/image'
import type { EntertainmentComment, EntertainmentItem } from '../../services/entertainmentApi'

interface EntertainmentTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  detail: {
    _id: string
    description?: string
    type?: 'movie' | 'music' | 'podcast'
  }
  relatedItems: EntertainmentItem[]
  comments: EntertainmentComment[]
  loadingComments: boolean
  submittingComment: boolean
  onCreateComment: (content: string) => Promise<void>
}

export function EntertainmentTabs({
  activeTab,
  setActiveTab,
  detail,
  relatedItems,
  comments,
  loadingComments,
  submittingComment,
  onCreateComment
}: EntertainmentTabsProps) {
  const [newComment, setNewComment] = useState('')
  const commentCount = comments.length
  const hasEpisodes = relatedItems.length > 0

  const renderedComments = useMemo(() => comments, [comments])

  useEffect(() => {
    if (!hasEpisodes && activeTab === 'episodes') {
      setActiveTab('description')
    }
  }, [hasEpisodes, activeTab, setActiveTab])

  const formatCommentTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Vừa xong'
    return date.toLocaleString('vi-VN')
  }

  const handleSubmitComment = async () => {
    const content = newComment.trim()
    if (!content) return
    await onCreateComment(content)
    setNewComment('')
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-8 border-b border-gray-100 dark:border-gray-800 rounded-none">
          {[
            { id: 'description', label: 'Mô tả', icon: Info },
            ...(hasEpisodes ? [{ id: 'episodes', label: 'Danh sách tập', icon: List }] : []),
            { id: 'comments', label: 'Bình luận', icon: MessageSquare }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative rounded-none border-b-2 border-transparent px-1 py-4 text-sm font-semibold transition-all data-[state=active]:bg-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.id === 'comments' && <span className="ml-1.5 text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{commentCount}</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="description" className="pt-6 outline-none">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {detail.description ? (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {detail.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Không có mô tả cho nội dung này.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {['#English', '#Learning', '#Entertainment', '#Vocabulary'].map((tag) => (
                    <span key={tag} className="text-xs text-blue-500 hover:underline cursor-pointer font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {hasEpisodes && (
              <TabsContent value="episodes" className="pt-6 outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedItems.map((item, index) => (
                    <Link
                      key={item._id}
                      href={`/entertainment/${detail.type}s/${item._id}`}
                      className="flex flex-col gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group active:scale-[0.98]"
                    >
                      <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                        {item.thumbnailUrl && (
                          <Image
                            src={typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : item.thumbnailUrl.url}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-10 w-10 text-white fill-current" />
                        </div>
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
                          12:45
                        </div>
                      </div>
                      <div className="min-w-0 px-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                          Tập {index + 1}: {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-xs text-gray-500 truncate">{item.author}</p>
                          <span className="h-1 w-1 bg-gray-300 rounded-full" />
                          <p className="text-[10px] text-gray-400">1 tuần trước</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="comments" className="pt-6 outline-none space-y-8">
              <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Avatar className="h-10 w-10 shadow-sm">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=User&background=random`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Viết bình luận của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] border-none bg-transparent focus-visible:ring-0 p-0 resize-none placeholder:text-gray-400"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      {/* Emoji/Format options could go here */}
                    </div>
                    <Button
                      size="sm"
                      disabled={submittingComment || !newComment.trim()}
                      onClick={() => void handleSubmitComment()}
                      className="rounded-full px-5 bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/20"
                    >
                      {submittingComment ? 'Đang gửi...' : 'Bình luận'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                {loadingComments ? (
                  <p className="text-sm text-gray-500 italic">Đang tải bình luận...</p>
                ) : renderedComments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên bình luận.</p>
                ) : (
                  renderedComments.map((comment) => (
                    <div key={comment._id} className="flex gap-4 group">
                      <Avatar className="h-10 w-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${comment.user.fullName}&background=random`} />
                        <AvatarFallback>{comment.user.fullName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{comment.user.fullName}</p>
                          <span className="text-[10px] text-gray-400">{formatCommentTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-2xl rounded-tl-none border border-gray-50 dark:border-gray-800/50">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-5 mt-1 px-1">
                          <button className="text-xs text-gray-500 hover:text-blue-600 font-semibold flex items-center gap-1.5 transition-colors">
                            <ThumbsUp className="h-3.5 w-3.5" /> 0
                          </button>
                          <button className="text-xs text-gray-500 hover:text-blue-600 font-semibold transition-colors">
                            Phản hồi
                          </button>
                          <button className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Flag className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )))}
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
