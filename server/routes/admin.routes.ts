import express from 'express'
import { authenticateTokenAdmin, requireRole } from '../middleware/auth.middleware'
import { AdminDashboardController } from '../controllers/adminDashboard.controller'

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/dashboard/overview", authenticateTokenAdmin, requireRole(["admin", "content"]), AdminDashboardController.getOverview);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

export const adminRoutes = router;


