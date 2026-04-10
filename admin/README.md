# English Master Admin

Ứng dụng quản trị dành cho đội ngũ vận hành hệ thống English Master.

## Vai trò trong hệ thống

- Quản trị toàn bộ nội dung học tập theo từng kỹ năng.
- Theo dõi hoạt động hệ thống qua dashboard, báo cáo và thống kê.
- Vận hành nghiệp vụ thương mại gồm gói học, khuyến mãi và thanh toán.
- Quản lý tài khoản, phân quyền và dữ liệu nền tảng.

## Phân hệ chức năng quản trị

- **Quản lý nội dung học tập**
  - Vocabulary, Grammar, Listening, Reading, Writing, IPA, Speaking.
  - CRUD bài học, quản lý trạng thái hiển thị, nội dung VIP, sắp xếp thứ tự.
  - Quản lý quiz, ví dụ, nội dung đi kèm theo từng module.
- **Import/Export dữ liệu**
  - Hỗ trợ nhập/xuất dữ liệu qua JSON/Excel ở nhiều phân hệ.
  - Kiểm tra dữ liệu đầu vào trước khi ghi nhận.
- **Quản lý media**
  - Upload/xóa media đơn lẻ và hàng loạt.
  - Quản lý video và subtitle.
- **Quản lý lộ trình (Roadmap)**
  - Tạo/chỉnh sửa topic lộ trình.
  - Gắn bài học vào topic và sắp xếp thứ tự hiển thị.
- **Quản lý người dùng và phân quyền**
  - Quản lý danh sách tài khoản.
  - Cập nhật trạng thái hoạt động và thông tin vai trò.
- **Billing và doanh thu**
  - Quản lý `plan` và `coupon`.
  - Theo dõi giao dịch `payment`.
- **Dashboard - Báo cáo - Thống kê**
  - Tổng quan KPI vận hành.
  - Báo cáo theo thời gian, danh mục và nguồn doanh thu.

## Nhóm API mà Admin sử dụng

Admin chủ yếu làm việc với các nhóm API:

- `admin`, `report`
- `user`, `user-scores`
- `vocabulary`, `grammar`, `reading`, `listening`, `writing`, `ipa`, `speaking`
- `roadmap`, `media`, `entertainment`
- `plan`, `coupon`, `payment`

Chi tiết endpoint xem tại [`../server/README.md`](../server/README.md).

## Cấu trúc mã nguồn chính

```text
admin/
  src/app/        # Route và layout trang quản trị
  src/features/   # Tổ chức theo module nghiệp vụ
  src/components/ # Thành phần UI dùng chung
  src/lib/        # API clients, tiện ích
```

## Liên quan

- Backend API: `../server`
- Ứng dụng người học: `../client`
