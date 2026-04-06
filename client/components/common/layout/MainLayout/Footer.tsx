import Link from "next/link";
import { FacebookIcon, InstagramIcon, TiktokIcon, TwitterIcon } from "../../icons";

export function Footer() {
  return (
    <footer className="w-full p-4 px-8 border-t border-gray-200">
      <div className="grid grid-cols-1 xl:grid-cols-4 xl:gap-4 gap-8 py-4 w-full">
        {/* EnglishMaster */}
        <div>
          <span className="font-bold text-2xl">EnglishMaster</span>
          <p className="text-gray-500 mt-4">Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam với phương pháp học hiệu quả và cá nhân hóa</p>
          {/* Liên kết mạng xã hội */}
          <div className="flex items-center gap-2 mt-2">
            <Link href="/"><FacebookIcon /></Link>
            <Link href="/"><InstagramIcon /></Link>
            <Link href="/"><TiktokIcon /></Link>
            <Link href="/"><TwitterIcon /></Link>
          </div>
        </div>
        {/* Liên kết nhanh */}
        <div>
          <span className="font-bold text-2xl">Liên kết nhanh</span>
          <ul className="flex flex-col gap-2 text-gray-500 mt-4">
            <li><Link href="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><Link href="/" className="hover:text-primary">Lộ trình học tập</Link></li>
            <li><Link href="/" className="hover:text-primary">Học tập</Link></li>
            <li><Link href="/" className="hover:text-primary">Luyện tập</Link></li>
            <li><Link href="/" className="hover:text-primary">Giải trí</Link></li>
            <li><Link href="/" className="hover:text-primary">Cộng đồng</Link></li>
          </ul>
        </div>
        {/* Hỗ trợ */}
        <div>
          <span className="font-bold text-2xl">Hỗ trợ</span>
          <ul className="flex flex-col gap-2 text-gray-500 mt-4">
            <li><Link href="/" className="hover:text-primary">Trung Tâm hỗ trợ</Link></li>
            <li><Link href="/" className="hover:text-primary">Câu hỏi thường gặp</Link></li>
            <li><Link href="/" className="hover:text-primary">Liên hệ</Link></li>
            <li><Link href="/" className="hover:text-primary">Chính sách bảo mật</Link></li>
            <li><Link href="/" className="hover:text-primary">Điểu khoản sử dụng</Link></li>
          </ul>
        </div>

        <div>
          <span className="font-bold text-2xl">Liên hệ</span>
          <ul className="flex flex-col gap-2 text-gray-500 mt-4">
            <li>0393 900 748</li>
            <li>EnglishMaster@gmail.com</li>
            <li>Đại học Duy Tân, Đà Nẵng</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-gray-500">© 2024 EnglishMaster - Tất cả các quyền được bảo lưu</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-primary">Chính sách bảo mật</Link>
          <Link href="/" className="text-gray-500 hover:text-primary">Điều khoản và điều kiện</Link>
          <Link href="/" className="text-gray-500 hover:text-primary">Quyền riêng tư</Link>
          <Link href="/" className="text-gray-500 hover:text-primary">Liên hệ</Link>
        </div>
      </div>
    </footer>
  )
}
