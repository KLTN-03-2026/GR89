'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { changeMyPassword } from '@/features/account/services/accountApi'
import { toast } from 'react-toastify'

export default function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [current, setCurrent] = useState('')
  const [nextPwd, setNextPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const rules = useMemo(() => ({
    length: nextPwd.length >= 6 && nextPwd.length <= 50,
    notSame: nextPwd !== current && nextPwd.length > 0,
    complexity: /[a-z]/.test(nextPwd) && /[A-Z]/.test(nextPwd) && /\d/.test(nextPwd)
  }), [current, nextPwd])

  const canSubmit = rules.length && rules.notSame && rules.complexity && nextPwd === confirm && current.length > 0

  const handleSave = async () => {
    if (!canSubmit) return
    setLoading(true)
    await changeMyPassword({ oldPassword: current, newPassword: nextPwd })
      .then(res => {
        if (res.success) {
          toast.success('Đổi mật khẩu thành công')
          setCurrent('')
          setNextPwd('')
          setConfirm('')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (

    <Card className="border rounded-xl bg-white w-full mx-auto">
      <CardHeader>
        <div className="flex flex-col items-center gap-3 py-1">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center">
            <CardTitle className="text-lg font-semibold text-gray-900">Đổi mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu cũ và mật khẩu mới</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-sm font-semibold text-gray-700">Mật khẩu cũ</Label>
          <div className="relative">
            <Input id="current-password" type={showCurrent ? 'text' : 'password'} value={current} onChange={(e) => setCurrent(e.target.value)} className="bg-white border-gray-200 pr-10 py-6" />
            <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700">Mật khẩu mới</Label>
          <div className="relative">
            <Input id="new-password" type={showNew ? 'text' : 'password'} value={nextPwd} onChange={(e) => setNextPwd(e.target.value)} className="bg-white border-gray-200 pr-10 py-6" />
            <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Input id="confirm-password" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-white border-gray-200 pr-10 py-6" />
            <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Rules */}
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className={`flex items-center gap-2 ${rules.length ? 'text-green-600' : 'text-gray-500'}`}>
            <CheckCircle2 className="w-4 h-4" /> Mật khẩu 6–50 ký tự
          </div>
          <div className={`flex items-center gap-2 ${rules.notSame ? 'text-green-600' : 'text-gray-500'}`}>
            <CheckCircle2 className="w-4 h-4" /> Khác mật khẩu cũ
          </div>
          <div className={`flex items-center gap-2 ${rules.complexity ? 'text-green-600' : 'text-gray-500'}`}>
            <CheckCircle2 className="w-4 h-4" /> Có ít nhất 1 chữ thường, 1 chữ hoa, 1 số
          </div>
          <div className={`flex items-center gap-2 ${nextPwd === confirm && confirm ? 'text-green-600' : 'text-gray-500'}`}>
            <CheckCircle2 className="w-4 h-4" /> Trùng khớp xác nhận
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Button disabled={!canSubmit || loading} onClick={handleSave} className={`h-10 px-8 ${canSubmit && !loading ? 'bg-gray-900 hover:bg-black text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Lưu
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


