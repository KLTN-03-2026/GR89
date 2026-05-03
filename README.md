# ActiveLearning - Website học tiếng Anh trực tuyến tích hợp AI chấm điểm tự động và chatbot hỗ trợ học tập

ActiveLearning là hệ thống học tiếng Anh toàn diện, kết hợp nội dung học theo kỹ năng, chấm điểm tự động và hỗ trợ AI để cá nhân hóa lộ trình học cho từng người dùng.

## Tổng quan đề tài

- **Loại sản phẩm**: Nền tảng web học tiếng Anh cho người học và hệ quản trị nội dung.
- **Mục tiêu**:
  - Nâng cao hiệu quả tự học qua bài học có cấu trúc.
  - Theo dõi tiến độ và năng lực người học theo thời gian.
  - Hỗ trợ gợi ý bài học tiếp theo dựa trên lịch sử học và điểm số.
- **Đối tượng sử dụng**:
  - Học viên (Client App)
  - Quản trị viên/Nội dung viên (Admin App)

## Giá trị nổi bật

- Đầy đủ 7 kỹ năng/chuyên đề: `Vocabulary`, `Grammar`, `Listening`, `Reading`, `Writing`, `IPA`, `Speaking`.
- Tự động chấm điểm phát âm (IPA/Speaking) và đánh giá bài viết (Writing).
- Trợ lý AI đưa ra gợi ý cải thiện ngắn gọn, dễ áp dụng.
- Dashboard vận hành và báo cáo tổng hợp theo bộ lọc thời gian, danh mục.
- Hỗ trợ mô hình thương mại: gói học, mã giảm giá, thanh toán online.

## Kiến trúc hệ thống

```text
Client (Người học) ----\
                        -> REST API Server -> MongoDB
Admin Dashboard -------/

REST API Server <-> AI Provider / SpeechAce / Cloudinary / VNPay / SMTP
```

## Thành phần dự án

- `client`: ứng dụng học tập cho học viên.
- `admin`: hệ thống quản trị nội dung, người dùng, billing, báo cáo.
- `server`: backend API, xử lý nghiệp vụ, xác thực, thống kê.

## Chức năng theo phân hệ

- **Học tập**
  - Học theo chủ đề và kỹ năng.
  - Làm quiz, nộp bài, xem kết quả.
  - Lưu lịch sử học tập và thống kê tiến độ.
- **AI và chấm điểm**
  - Chấm phát âm từ audio.
  - Sinh feedback cải thiện phát âm.
  - Chatbot gợi ý bài học tiếp theo kèm hướng dẫn.
- **Quản trị nội dung**
  - CRUD bài học cho tất cả module.
  - Import/Export dữ liệu (JSON/Excel) ở nhiều phân hệ.
  - Quản lý media và subtitle.
- **Báo cáo và vận hành**
  - Tổng quan dashboard.
  - Báo cáo doanh thu, bài học, người học.
  - Thống kê điểm và phân tích kỹ năng.
- **Billing**
  - Quản lý `plan`, `coupon`.
  - Thanh toán qua VNPay và theo dõi giao dịch.

## Danh mục API cấp cao

Tất cả API được đặt dưới tiền tố: `/api`.

- `auth`: xác thực, đăng ký/đăng nhập, refresh token, quên mật khẩu.
- `user`, `admin`: thông tin tài khoản và dashboard quản trị.
- `vocabulary`, `grammar`, `reading`, `listening`, `writing`, `ipa`, `speaking`: nghiệp vụ học tập.
- `roadmap`: lộ trình học và ánh xạ bài học theo chủ đề.
- `report`, `user-scores`: báo cáo tổng hợp và thống kê năng lực.
- `chatbot`: chat và gợi ý học tập bằng AI.
- `media`: quản lý tệp media và subtitle.
- `plan`, `coupon`, `payment`: nghiệp vụ thu phí và giao dịch.
- `quiz`, `entertainment`: ngân hàng câu hỏi và nội dung bổ trợ.

Xem danh sách endpoint chi tiết trong [`server/README.md`](server/README.md).

## Tài liệu bổ sung

- [`server/README.md`](server/README.md): tài liệu API chi tiết theo từng module.
- [`client/README.md`](client/README.md): mô tả chức năng giao diện người học.
- [`admin/README.md`](admin/README.md): mô tả chức năng giao diện quản trị.

