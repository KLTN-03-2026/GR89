import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateTokenAdmin, authenticateTokenForLogout, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

//ĐĂNG KÍ TÀI KHOẢN
router.post('/register', AuthController.register)

// XÁC NHẬN EMAIL
router.get('/verify-email', AuthController.verifyEmail)

// QUÊN MẬT KHẨU
router.post('/forgot-password', AuthController.requestPasswordReset);

// ĐẶT LẠI MẬT KHẨU
router.post('/reset-password', AuthController.resetPassword);

// ĐĂNG NHẬP
router.post('/login', AuthController.login)

// ĐĂNG NHẬP VỚI GOOGLE
router.post('/login/google', AuthController.loginGoogle)

// REFESH TOKEN
router.post('/refresh-token', AuthController.refeshToken)

// ĐĂNG XUẤT NGƯỜI DÙNG
router.post('/logout', authenticateTokenForLogout, AuthController.logout)

// ĐĂNG XUẤT ADMIN
router.post('/admin/logout', authenticateTokenForLogout, AuthController.logout)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

// ĐĂNG NHẬP TỰ ĐỘNG XÁC ĐỊNH ROLE (CHO ADMIN PANEL)
router.post('/login-admin', AuthController.loginAdmin)

// (ADMIN) TẠO USER MỚI
router.post('/create-user', authenticateTokenAdmin, requireRole(['admin', 'content']), AuthController.createUser)

export const authRoutes = router;
