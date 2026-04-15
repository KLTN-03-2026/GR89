'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Mail, User as UserIcon, Loader2, Crown, CalendarDays, Phone, Flag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'react-toastify'
import { useAuth } from '@/libs/contexts/AuthContext'
import Image from 'next/image'

interface ProfileTabProps {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  onEdit: () => void
  onCancel: () => void
}

export default function ProfileTab({ isEditing, onEdit, onCancel, setIsEditing }: ProfileTabProps) {
  const { isLoading, updateUser, updateAvatar, user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    phone: user?.phone || '',
    country: user?.country || '',
    city: user?.city || '',
    avatar: user?.avatar || null,
  })
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isEditing) {
      setForm({
        fullName: user?.fullName || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        phone: user?.phone || '',
        country: user?.country || '',
        city: user?.city || '',
        avatar: user?.avatar || null,
      })
    }
  }, [user, isEditing])

  const onPickAvatar = () => fileRef.current?.click()
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setForm((prev) => ({ ...prev, avatar: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const onSaveAvatar = async () => {
    if (!selectedAvatarFile || !form.avatar) return
    setUploading(true)

    await updateAvatar(selectedAvatarFile)
      .then(() => {
        setSelectedAvatarFile(null)
        setOpen(false)
        toast.success('Cập nhật avatar thành công')
      })
      .finally(() => {
        setUploading(false)
      })
  }

  const handleCancel = () => {
    setForm({
      fullName: user?.fullName || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      phone: user?.phone || '',
      country: user?.country || '',
      city: user?.city || '',
      avatar: user?.avatar || null,
    })
    setSelectedAvatarFile(null)
    onCancel()
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      toast.error('Tên phải có ít nhất 3 ký tự')
      return
    }

    setUploading(true)
    await updateUser({
      ...user,
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth || null,
      phone: form.phone.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
    })
      .then(() => {
        toast.success('Cập nhật thông tin thành công')
        setForm({
          fullName: user?.fullName || '',
          dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
          phone: user?.phone || '',
          country: user?.country || '',
          city: user?.city || '',
          avatar: user?.avatar || null,
        })
      })
      .finally(() => {
        setUploading(false)
        setIsEditing(false)
      })
  }

  return (
    <div className="space-y-8 w-full">
      {/* Minimal header */}
      <Card className="border rounded-xl bg-white p-6 w-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold overflow-hidden">
                {form.avatar ? (
                  <Image src={form.avatar} alt="avatar" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.fullName || form.fullName || 'U').charAt(0)}</span>
                )}
              </div>
              <button onClick={() => setOpen(true)} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center border border-gray-200" title="Thay đổi ảnh">
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-gray-900">{form.fullName || user?.fullName || 'Người dùng'}</h3>
                {user?.isVip && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                    <Crown className="w-3 h-3" />
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Quản lý thông tin cá nhân</p>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={onEdit} className="h-8 px-3">Chỉnh sửa</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>Hủy</Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading} className="bg-gray-900 hover:bg-black text-white">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Lưu
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Avatar Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {form.avatar ? (
                  <Image src={form.avatar as string} alt="preview" width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={onPickAvatar}>Chọn ảnh</Button>
              {selectedAvatarFile && (
                <Button variant="outline" onClick={() => setForm((prev) => ({ ...prev, avatar: user?.avatar || null }))}>Xóa chọn</Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOpen(false)
              setSelectedAvatarFile(null)
              setForm((prev) => ({ ...prev, avatar: user?.avatar || null }))
            }} disabled={uploading}>Hủy</Button>
            <Button onClick={onSaveAvatar} disabled={!selectedAvatarFile || uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border rounded-xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </div>
            <div className="hidden sm:block text-xs text-gray-500">Các trường có dấu * là bắt buộc</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Họ và tên*</Label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="name" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} disabled={!isEditing || uploading} className={`pl-9 ${!isEditing ? 'bg-gray-50' : 'bg-white'} border-gray-200`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email*</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="email" value={user?.email || ''} disabled className={`pl-9 bg-gray-50 border-gray-200`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">Ngày sinh</Label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  disabled={!isEditing || uploading}
                  className={`pl-9 ${!isEditing ? 'bg-gray-50' : 'bg-white'} border-gray-200`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Số điện thoại</Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+84 9xxxxxxxx"
                  disabled={!isEditing}
                  className={`pl-9 ${!isEditing ? 'bg-gray-50' : 'bg-white'} border-gray-200`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-semibold text-gray-700">Quốc gia</Label>
              <div className="relative">
                <Flag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Việt Nam"
                  disabled={!isEditing}
                  className={`pl-9 ${!isEditing ? 'bg-gray-50' : 'bg-white'} border-gray-200`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold text-gray-700">Tỉnh thành</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Hà Nội"
                disabled={!isEditing}
                className={`${!isEditing ? 'bg-gray-50' : 'bg-white'} border-gray-200`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


