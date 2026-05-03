# ActiveLearning Client

Ứng dụng học tập dành cho học viên trong hệ sinh thái ActiveLearning.

## Vai trò trong hệ thống

- Cung cấp trải nghiệm học tập theo lộ trình và theo từng kỹ năng.
- Hiển thị nội dung bài học, bài luyện tập, kết quả và tiến độ học.
- Kết nối API để đồng bộ điểm số, lịch sử học tập và trạng thái tài khoản.

## Các phân hệ chức năng

- **Vocabulary**: học từ vựng theo chủ đề, làm quiz và xem kết quả.
- **Grammar**: học ngữ pháp theo topic, luyện tập và theo dõi mức độ thành thạo.
- **Listening**: luyện nghe theo bài, làm bài và xem đáp án/kết quả.
- **Reading**: đọc hiểu, làm câu hỏi theo bài, theo dõi hiệu suất.
- **Writing**: nộp bài viết và nhận đánh giá.
- **IPA**: luyện phát âm từng từ/âm với chấm điểm phát âm tự động.
- **Speaking**: ghi âm theo câu, chấm điểm và nhận feedback cải thiện.
- **Roadmap học tập**: theo dõi danh sách bài nên học theo tiến trình cá nhân.

## Trải nghiệm người dùng nổi bật

- Đăng ký/đăng nhập, hỗ trợ social login.
- Theo dõi lịch sử học và kết quả theo từng kỹ năng.
- Nhận gợi ý cải thiện từ AI trong một số ngữ cảnh học tập.
- Giao diện tối ưu cho hành vi học liên tục theo phiên.

## Tích hợp API

- Base API: `/api` từ backend.
- Tập trung gọi API qua các lớp trong `libs/apis/*`.
- Có cơ chế gọi API thường và API cần xác thực.

## Cấu trúc mã nguồn

```text
client/
  app/        # Route và layout
  features/   # Chia theo nghiệp vụ học tập
  components/ # Thành phần dùng chung
  libs/       # API clients, utilities
```

## Liên quan

- Backend API: `../server`
- Hệ quản trị: `../admin`