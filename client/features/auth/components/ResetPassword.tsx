'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { resetPassword } from '@/features/auth/services/authApi'

function strengthLabel(score: number) {
  if (score >= 4) return { label: 'Rất mạnh', color: 'bg-emerald-500' };
  if (score === 3) return { label: 'Mạnh', color: 'bg-green-600' };
  if (score === 2) return { label: 'Trung bình', color: 'bg-amber-500' };
  if (score === 1) return { label: 'Yếu', color: 'bg-orange-500' };
  return { label: 'Rất yếu', color: 'bg-red-500' };
}
function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwScore = useMemo(() => scorePassword(password), [password]);
  const { label, color } = strengthLabel(pwScore);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return toast.error('Thiếu token.');
    if (!password || !confirm) return toast.error('Vui lòng nhập đủ thông tin.');
    if (password.length < 8) return toast.error('Mật khẩu phải ≥ 8 ký tự.');
    if (password !== confirm) return toast.error('Mật khẩu không khớp.');

    setLoading(true);
    await resetPassword(token, password, confirm)
      .then(() => {
        toast.success('Đặt lại mật khẩu thành công.');
        router.replace('/login')
      })
      .finally(() => {
        setLoading(false);
      })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-lg px-4 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-7h-1V7a5 5 0 0 0-10 0v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-3a3 3 0 1 1 6 0v3H10V7Zm8 12H6v-7h12v7Z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Đặt lại mật khẩu</h1>
              <p className="text-sm text-slate-600">Tạo mật khẩu mạnh, dễ nhớ.</p>
            </div>
          </div>

          {!token && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Thiếu token trên URL. Vui lòng mở link từ email.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-slate-500 hover:text-slate-700"
                >
                  {showPw ? 'Ẩn' : 'Hiện'}
                </button>
              </div>

              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-slate-200">
                  <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${(pwScore / 4) * 100}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-600">Độ mạnh: {label}</div>
                <ul className="mt-2 grid list-disc gap-1 pl-5 text-xs text-slate-500">
                  <li>≥ 8 ký tự</li>
                  <li>Có chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showCf ? 'text' : 'password'}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCf((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-slate-500 hover:text-slate-700"
                >
                  {showCf ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="mt-1 text-xs text-red-600">Mật khẩu không khớp.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </button>

            <div className="pt-1 text-center text-xs text-slate-500">
              Sau khi đổi, bạn sẽ được yêu cầu đăng nhập lại.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
