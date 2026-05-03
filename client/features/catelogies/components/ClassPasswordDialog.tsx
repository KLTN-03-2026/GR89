import { Lock, MapPin, Phone, MessageCircle, ArrowRight, ShieldCheck, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { IClass } from "../types"
import { toast } from "react-toastify"

interface ClassPasswordDialogProps {
  classItem: IClass | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (id: string) => void
}

export function ClassPasswordDialog({ classItem, isOpen, onClose, onSuccess }: ClassPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (!classItem) return
    setIsVerifying(true)

    // Mock password verification (Mật khẩu mặc định là 123456 cho demo)
    setTimeout(() => {
      if (password === "123456") {
        toast.success("Xác thực thành công!")
        onSuccess(classItem.id)
        setPassword("")
      } else {
        toast.error("Mật khẩu không chính xác. Vui lòng thử lại!")
        setPassword("")
      }
      setIsVerifying(false)
    }, 800)
  }

  if (!classItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header with Branding */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-yellow-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Khu vực giới hạn</span>
          </div>

          <DialogHeader className="text-left p-0">
            <DialogTitle className="text-3xl font-extrabold text-white mb-2">Xác thực quyền truy cập</DialogTitle>
            <DialogDescription className="text-blue-100/80 text-base leading-relaxed">
              Lớp <span className="text-white font-bold">"{classItem.name}"</span> dành riêng cho học viên trực tiếp tại trung tâm. Vui lòng nhập mã truy cập được cấp bởi giáo viên.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8 bg-white">
          {/* Password Input Area */}
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full text-blue-600 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Mã PIN lớp học</p>
            </div>

            <InputOTP
              maxLength={6}
              value={password}
              onChange={setPassword}
              disabled={isVerifying}
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-14 text-xl font-bold border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 transition-all active:scale-95"
              onClick={handleVerify}
              disabled={password.length !== 6 || isVerifying}
            >
              {isVerifying ? "Đang xác thực..." : "Vào lớp ngay"}
              {!isVerifying && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>

          {/* Center Info Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Thông tin Trung tâm ActiveLearning</h4>
              <p className="text-xs text-gray-500 italic">Dành cho khách tham quan muốn đăng ký khóa học:</p>
            </div>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-xs font-medium text-gray-700 leading-normal">
                  Địa chỉ: 123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>

              <div className="flex gap-2">
                <a href="tel:0123456789" className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-bold">Hotline</span>
                </a>
                <a href="#" className="flex-1 flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">Zalo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
