import express from 'express'
import { authenticateTokenAdmin, requireRole } from '../middleware/auth.middleware'
import { AdminDashboardController } from '../controllers/adminDashboard.controller'
import { AdminActivityController } from '../controllers/adminActivity.controller'

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/dashboard/overview", authenticateTokenAdmin, requireRole(["admin", "content"]), AdminDashboardController.getOverview);
router.get("/activities", authenticateTokenAdmin, requireRole(["admin", "content"]), AdminActivityController.getActivities);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

export const adminRoutes = router;


