# ActiveLearning API

Tài liệu nghiệp vụ và danh mục endpoint cho backend ActiveLearning.

## Tổng quan backend

- **Kiểu kiến trúc**: RESTful API theo module.
- **Vai trò**: xác thực người dùng, quản lý nội dung học, chấm điểm, báo cáo, thanh toán.
- **Base path**: `/api`.
- **Nhóm quyền chính**:
  - `user`: học viên.
  - `admin`, `content`: quản trị và quản lý nội dung.

## Công nghệ và tích hợp

- Express + TypeScript + MongoDB (Mongoose)
- JWT/Cookie Authentication
- AI Provider (chatbot/feedback)
- SpeechAce (đánh giá phát âm)
- Cloudinary (media storage)
- VNPay (thanh toán)
- SMTP (email xác thực và khôi phục mật khẩu)

## Danh sách API theo module

Ghi chú:
- Bên dưới là danh mục endpoint chính để phục vụ tài liệu dự án.
- Một số module còn endpoint phụ phục vụ import/export, bulk update, hoặc thao tác chi tiết.

### 1) Xác thực - `/auth`

- `POST /register`
- `GET /verify-email`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /login`
- `POST /login/google`
- `POST /refresh-token`
- `POST /logout`
- `POST /admin/logout`
- `POST /login-admin`
- `POST /create-user`

### 2) User - `/user`

- `GET /`
- `GET /export`
- `GET /lesson-stats`
- `GET /streak/status`
- `GET /me/user`
- `GET /me/admin`
- `PUT /me`
- `PUT /me/avatar`
- `PUT /me/password`
- `PUT /bulk/status`
- `PUT /:id`
- `PUT /:id/status`
- `DELETE /:id`

### 3) Dashboard quản trị - `/admin`

- `GET /dashboard/overview`

### 4) Báo cáo - `/report`

- `GET /dashboard`

### 5) Roadmap - `/roadmap`

- `GET /lessons/type`
- `GET /topics`
- `PUT /topics/reorder`
- `GET /topics/:id`
- `GET /topics/:id/lessons`
- `POST /topics`
- `PUT /topics/:id`
- `DELETE /topics/:id`
- `PUT /topics/:id/lessons/reorder`
- `POST /topics/:id/lessons`
- `DELETE /topics/:topicId/lessons/:lessonId`
- `GET /user`

### 6) Vocabulary - `/vocabulary`

- `GET /topics-admin`
- `POST /create-topic`
- `PUT /topic/:id`
- `PUT /topic/:id/status`
- `PATCH /topic/:id/swap-order`
- `PATCH /topic/:id/vip`
- `DELETE /topic/:id`
- `GET /:id` (admin theo topic)
- `POST /create`
- `PUT /:id`
- `DELETE /:id`
- `GET /topics-user`
- `GET /overview-user`
- `GET /:id/user`
- `GET /:id/quiz/user`
- `POST /:id/do`
- `GET /:id/result`
- `GET /export`
- `POST /import-json`

### 7) Grammar - `/grammar`

- `GET /`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/status`
- `PATCH /:id/vip`
- `PATCH /:id/swap-order`
- `PUT /:id/sections`
- `PUT /:id/practice`
- `PUT /:id/quizzes`
- `GET /user`
- `GET /overview`
- `GET /user-stats`
- `GET /time-series`
- `GET /export`
- `POST /import-json`

### 8) Reading - `/reading`

- `GET /`
- `POST /create`
- `GET /:id`
- `PUT /update/:id`
- `DELETE /delete/:id`
- `PUT /:id/status`
- `PATCH /:id/vip`
- `PATCH /:id/swap-order`
- `POST /create-quiz/:id`
- `DELETE /delete-quiz/:id`
- `POST /create-vocabulary/:id`
- `PUT /update-vocabulary/:id`
- `DELETE /delete-vocabulary/:id`
- `GET /user`
- `GET /user/:id`
- `GET /:id/quiz`
- `POST /:id/do`
- `GET /:id/result`
- `GET /export`
- `POST /import-json`

### 9) Listening - `/listening`

- `GET /`
- `POST /create`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/status`
- `PATCH /:id/vip`
- `PATCH /:id/swap-order`
- `GET /user`
- `GET /user/:id`
- `POST /do/:id`
- `GET /:id/result`
- `GET /export`
- `POST /import-json`

### 10) Writing - `/writing`

- `GET /`
- `POST /create`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/status`
- `PATCH /:id/vip`
- `PATCH /:id/swap-order`
- `GET /user`
- `GET /user/:id`
- `POST /evaluate/:id`
- `GET /:id/result`
- `GET /export`
- `POST /import-json`

### 11) IPA - `/ipa`

- `GET /`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/status`
- `PATCH /:id/vip`
- `PATCH /:id/swap-order`
- `POST /:id/example`
- `PUT /:id/example`
- `DELETE /:id/example`
- `DELETE /:id/examples`
- `GET /user`
- `GET /user/:id`
- `POST /assess-pronunciation`
- `POST /users/save-highest-score/:lessonId`
- `GET /export`
- `POST /import-json`

### 12) Speaking - `/speaking`

- `GET /admin`
- `POST /admin`
- `GET /admin/:id`
- `PUT /admin/:id`
- `DELETE /admin/:id`
- `PUT /admin/:id/status`
- `PATCH /admin/:id/vip`
- `PATCH /admin/:id/swap-order`
- `GET /user`
- `GET /user/:id`
- `POST /assess-pronunciation`
- `GET /overview`
- `GET /stats/overview`
- `GET /export`
- `POST /import-json`

### 13) Media - `/media`

- `GET /`
- `GET /:id`
- `POST /upload/single`
- `POST /upload/multiple`
- `POST /upload/video`
- `POST /upload/video/youtube`
- `POST /upload/video/vimeo`
- `POST /upload/subtitle`
- `PUT /:mediaId/subtitle`
- `DELETE /:mediaId/subtitle`
- `PATCH /:id/title`
- `DELETE /:id`
- `DELETE /`

### 14) Entertainment - `/entertainment`

- `GET /`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PATCH /:id/status`
- `PATCH /:id/vip`
- `GET /user/list`
- `GET /user/:id`
- `GET /user/stats`
- `GET /overview`
- `GET /export`
- `POST /import-json`

### 15) Quiz - `/quiz`

- `GET /`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

### 16) Điểm người dùng - `/user-scores`

- `GET /`
- `GET /stats`
- `GET /skills`
- `GET /top`
- `GET /:userId`
- `PUT /:userId`

### 17) Billing

#### Plans - `/plan`
- `GET /`
- `GET /active`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/status`
- `GET /export`
- `POST /import`

#### Coupons - `/coupon`
- `GET /`
- `GET /validate`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/status`
- `GET /export`
- `POST /import`

#### Payments - `/payment`
- `GET /`
- `GET /:id`
- `GET /user`
- `POST /create-url`
- `POST /vnpay/callback`

### 18) Chatbot - `/chatbot`

- `GET /prompt`
- `POST /chat`

## Quy tắc bảo mật và truy cập

- Các endpoint quản trị yêu cầu token admin + role hợp lệ (`admin`, `content`).
- Endpoint người học yêu cầu token user.
- Một số endpoint học nội dung có kiểm tra quyền truy cập VIP.


