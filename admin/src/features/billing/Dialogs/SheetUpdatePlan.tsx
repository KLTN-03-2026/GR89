'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updatePlan, Plan } from '@/lib/apis/api'
import { toast } from 'react-toastify'
import {
  DollarSign,
  Calendar,
  Percent,
  ListChecks,
  Sparkles,
  Info,
  CreditCard,
  CheckCircle2,
  Settings2,
  FileText,
  Edit3,
  Loader2,
  Save
} from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from '@/components/ui/textarea'

interface SheetUpdatePlanProps {
  open: boolean
  setOpen: (v: boolean) => void
  plan: Plan
  callback?: () => void
}

export function SheetUpdatePlan({ open, setOpen, plan, callback }: SheetUpdatePlanProps) {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<Partial<Plan> & { features?: string | string[] }>({
    name: "",
    description: "",
    originalPrice: 0,
    billingCycle: "monthly",
    features: [],
    displayType: "default",
  })

  useEffect(() => {
    if (plan) {
      setDraft({
        name: plan.name,
        description: plan.description || "",
        originalPrice: plan.originalPrice || plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features,
        displayType: plan.displayType,
        discountPercent: plan.discountPercent,
      })
    }
  }, [plan])

  const handleSave = async () => {
    if (!draft.name?.trim()) {
      toast.error('Vui lòng nhập tên gói')
      return
    }
    if (draft.originalPrice === undefined || draft.originalPrice === null || draft.originalPrice < 0) {
      toast.error('Vui lòng nhập giá gốc hợp lệ (>= 0)')
      return
    }
    if (!draft.billingCycle) {
      toast.error('Vui lòng chọn chu kỳ thanh toán')
      return
    }

    try {
      // Calculate price from originalPrice and discountPercent
      let price = Number(draft.originalPrice)
      if (draft.discountPercent && draft.discountPercent > 0) {
        price = price * (1 - draft.discountPercent / 100)
      }

      const planData = {
        name: draft.name.trim(),
        description: draft.description?.trim() || undefined,
        price: price,
        currency: "VND",
        billingCycle: draft.billingCycle,
        features: (() => {
          if (typeof draft.features === 'string') {
            return draft.features.split('\n').filter(Boolean).map((f: string) => f.trim())
          }
          if (Array.isArray(draft.features)) {
            return draft.features.map((f: string | unknown) => typeof f === 'string' ? f.trim() : String(f))
          }
          return []
        })(),
        displayType: draft.displayType || 'default',
        originalPrice: Number(draft.originalPrice),
        discountPercent: draft.discountPercent !== undefined && draft.discountPercent !== null
          ? Number(draft.discountPercent)
          : undefined,
      }

      setLoading(true)
      await updatePlan(plan._id, planData)
      toast.success('Cập nhật gói thành công')
      callback?.()
      setOpen(false)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể lưu gói')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen && plan) {
        setDraft({
          name: plan.name,
          description: plan.description || "",
          originalPrice: plan.originalPrice || plan.price,
          billingCycle: plan.billingCycle,
          features: plan.features,
          displayType: plan.displayType,
          discountPercent: plan.discountPercent,
        })
      }
    }}>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Cập Nhật Gói</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chỉnh sửa thông tin cho gói "{plan?.name}"
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="w-4 h-4" />
                Thông Tin Định Danh
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5 col-span-2 md:col-span-1">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tên Gói <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="VD: Premium Pro, Plus..."
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5 col-span-2 md:col-span-1">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Loại Hiển Thị</Label>
                  <Select
                    value={draft.displayType}
                    onValueChange={(v: any) => setDraft({ ...draft, displayType: v })}
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="default" className="rounded-xl">Mặc định</SelectItem>
                      <SelectItem value="vip" className="rounded-xl text-amber-600 font-bold">VIP Gold</SelectItem>
                      <SelectItem value="premium" className="rounded-xl text-blue-600 font-bold">Premium Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5 col-span-2">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Mô Tả Gói
                  </Label>
                  <Textarea
                    className="bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-medium px-4 py-3 min-h-[100px] resize-none shadow-sm"
                    value={draft.description || ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Nhập mô tả ngắn gọn về quyền lợi của gói..."
                  />
                </div>
              </div>
            </section>

            {/* Section: Pricing */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <CreditCard className="w-4 h-4" />
                Cấu Hình Giá & Chu Kỳ
              </div>

              <div className="grid grid-cols-2 gap-6 bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Giá Gốc (VND) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      type="number"
                      min="0"
                      value={draft.originalPrice || ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setDraft({ ...draft, originalPrice: val ? (Number(val) >= 0 ? Number(val) : 0) : 0 })
                      }}
                      placeholder="0"
                      className="h-12 pl-10 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-black shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Chu Kỳ <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={draft.billingCycle}
                    onValueChange={(v: any) => setDraft({ ...draft, billingCycle: v })}
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="monthly" className="rounded-xl"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Hàng tháng</div></SelectItem>
                      <SelectItem value="yearly" className="rounded-xl"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Hàng năm</div></SelectItem>
                      <SelectItem value="lifetime" className="rounded-xl"><div className="flex items-center gap-2 text-amber-600 font-bold"><Sparkles className="w-4 h-4" /> Trọn đời</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5 col-span-2 md:col-span-1">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" /> Giảm Giá (%)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={draft.discountPercent || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      const num = val ? Number(val) : undefined
                      setDraft({ ...draft, discountPercent: num !== undefined && num >= 0 && num <= 100 ? num : undefined })
                    }}
                    placeholder="0"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold shadow-sm"
                  />
                </div>

                {draft.discountPercent && draft.discountPercent > 0 && draft.originalPrice && (
                  <div className="col-span-2 mt-2 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg shadow-blue-100 text-white animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-2 opacity-90 text-xs font-bold uppercase tracking-widest">
                      <span>Giá Sau Khi Áp Dụng Giảm Giá</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">Tiết kiệm {draft.discountPercent}%</span>
                    </div>
                    <div className="text-3xl font-black flex items-baseline gap-1">
                      {Math.round(Number(draft.originalPrice) * (1 - draft.discountPercent / 100)).toLocaleString('vi-VN')}
                      <span className="text-lg font-medium opacity-80">₫</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-bold bg-black/10 p-2 rounded-xl">
                      <CheckCircle2 className="w-3 h-3 text-blue-300" />
                      Hệ thống sẽ tự động cập nhật giá hiển thị cho người dùng
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Features */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <ListChecks className="w-4 h-4" />
                Đặc Quyền & Tính Năng
              </div>

              <div className="space-y-4 bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Danh Sách Đặc Quyền (Mỗi dòng một mục)</Label>
                <Textarea
                  className="bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-medium px-4 py-3 min-h-[160px] resize-none shadow-sm font-mono text-sm leading-relaxed"
                  value={typeof draft.features === 'string' ? draft.features : (Array.isArray(draft.features) ? draft.features.join('\n') : '')}
                  onChange={(e) => setDraft({ ...draft, features: e.target.value.split('\n') || [] })}
                  placeholder="Mở khóa tất cả bài học&#10;Hỗ trợ 24/7&#10;Không quảng cáo..."
                />
                <div className="flex items-start gap-2 text-[11px] text-amber-700/70 font-bold bg-amber-100/40 p-3 rounded-xl">
                  <Settings2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Ghi chú: Cập nhật tính năng sẽ ảnh hưởng ngay lập tức đến bảng so sánh giá trên ứng dụng.
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
            >
              Hủy Bỏ
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 font-black transition-all active:scale-95"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {loading ? 'Đang Cập Nhật...' : 'Lưu Thay Đổi'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
