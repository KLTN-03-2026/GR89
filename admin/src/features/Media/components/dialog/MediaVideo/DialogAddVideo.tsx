'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useMedia from "@/hooks/useMedia"
import { Upload, Video, Loader2, Link } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "react-toastify"
import { uploadVideoFromYoutube, uploadVideoFromVimeo } from "@/features/Media/services/api"
import Image from "next/image"

export function DialogAddVideo({ onLoad }: { onLoad?: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [vimeoUrl, setVimeoUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingVimeo, setIsUploadingVimeo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadVideo, loading } = useMedia()

  // Hàm xử lý khi chọn file video
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      handleUpload(file)
    } else {
      toast.error('Vui lòng chọn file video hợp lệ')
    }
  }

  // Hàm xử lý khi tải lên video
  const handleUpload = async (file: File) => {
    await uploadVideo(file)
    onLoad?.()
  }

  // Hàm xử lý thêm video từ YouTube
  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Vui lòng nhập link YouTube')
      return
    }

    // Kiểm tra định dạng YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(youtubeUrl)) {
      toast.error('Vui lòng nhập link YouTube hợp lệ')
      return
    }

    setIsUploading(true)
    await uploadVideoFromYoutube(youtubeUrl)
      .then(() => {
        toast.success('Đã thêm video YouTube thành công')
        setYoutubeUrl("")
        onLoad?.()
      })
      .finally(() => {
        setIsUploading(false)
      })
  }

  // Hàm lấy YouTube video ID từ URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Hàm tạo YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  const getVimeoVideoId = (url: string) => {
    const regex = /vimeo\.com\/(?:video\/|channels\/[\w]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/|)(\d+)/
    const match = url.match(regex)
    return match && match[1] ? match[1] : null
  }

  const getVimeoThumbnail = (url: string) => {
    const videoId = getVimeoVideoId(url)
    return videoId ? `https://vumbnail.com/${videoId}.jpg` : null
  }

  const handleVimeoSubmit = async () => {
    if (!vimeoUrl.trim()) {
      toast.error('Vui lòng nhập link Vimeo')
      return
    }
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/
    if (!vimeoRegex.test(vimeoUrl)) {
      toast.error('Vui lòng nhập link Vimeo hợp lệ')
      return
    }

    setIsUploadingVimeo(true)
    await uploadVideoFromVimeo(vimeoUrl)
      .then(() => {
        toast.success('Đã thêm video Vimeo thành công')
        setVimeoUrl("")
        onLoad?.()
      })
      .finally(() => setIsUploadingVimeo(false))
  }

  // Hàm xử lý khi kéo thả file
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // Hàm xử lý khi rời khỏi vùng kéo thả
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Hàm xử lý khi thả file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Hàm xử lý khi thay đổi file input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Hàm xử lý khi click vào card
  const handleClick = () => {
    if (!loading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <Card className="h-full flex flex-col min-h-[200px]">
      <CardContent className="flex flex-col h-full">
        <Tabs defaultValue="upload" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              YouTube Link
            </TabsTrigger>
            <TabsTrigger value="vimeo" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Vimeo Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="flex-1 mt-2">
            <Card
              className={`
                relative cursor-pointer transition-all duration-200 hover:shadow-md h-full flex flex-col border-dashed border-2
                ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <CardContent className="flex flex-col justify-center items-center h-full">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {loading ? (
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-purple-500 flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {loading ? 'Đang tải lên...' : 'Tải lên video'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Kéo thả file video hoặc click để chọn
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      MP4, AVI, MOV, WMV
                    </p>
                  </div>

                  {/* Nút Chọn file đẹp hơn */}
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    disabled={loading}
                  >
                    <Upload className="w-4 h-4" />
                    Chọn file
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="youtube" className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="flex flex-col justify-center h-full">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Thêm video từ YouTube
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Nhập link YouTube để thêm video
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">Link YouTube</Label>
                    <Input
                      id="youtube-url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  {/* YouTube Preview */}
                  {youtubeUrl && getYouTubeVideoId(youtubeUrl) && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="text-xs text-gray-600 mb-2">Preview:</div>
                      <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                        <Image
                          src={getYouTubeThumbnail(youtubeUrl) || ''}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleYoutubeSubmit}
                    disabled={isUploading || !youtubeUrl.trim()}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Thêm Video YouTube
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vimeo" className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="flex flex-col justify-center h-full">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Thêm video từ Vimeo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Nhập link Vimeo để thêm video
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vimeo-url">Link Vimeo</Label>
                    <Input
                      id="vimeo-url"
                      type="url"
                      placeholder="https://vimeo.com/123456789"
                      value={vimeoUrl}
                      onChange={(e) => setVimeoUrl(e.target.value)}
                      disabled={isUploadingVimeo}
                    />
                  </div>

                  {vimeoUrl && getVimeoVideoId(vimeoUrl) && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="text-xs text-gray-600 mb-2">Preview:</div>
                      <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                        <Image
                          src={getVimeoThumbnail(vimeoUrl) || ''}
                          alt="Vimeo thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleVimeoSubmit}
                    disabled={isUploadingVimeo || !vimeoUrl.trim()}
                    className="w-full"
                  >
                    {isUploadingVimeo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Thêm Video Vimeo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}