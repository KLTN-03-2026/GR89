import express, { NextFunction, Request, Response } from 'express'
import { UserController } from '../controllers/user.controller'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import { LessonStatsController } from '../controllers/lessonStats.controller'
import { upload } from '../middleware/upload.middleware'
const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/export", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.exportUserData);
router.get("/lesson-stats", authenticateTokenUser, requireRole(["user"]), LessonStatsController.getUserLessonStats);
router.get("/streak/status", authenticateTokenUser, CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { StreakService } = await import("../services/streak.service");
  const status = await StreakService.getStatus(req.user?._id || "");
  res.status(200).json({ success: true, data: status });
}));

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.getAllUsers);
router.put("/bulk/status", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.updateManyUsersStatus);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/me/user", authenticateTokenUser, requireRole(["user"]), UserController.getMe);
router.get("/me/admin", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.getMe);
router.put("/me", authenticateTokenUser, requireRole(["user"]), UserController.updateMe);
router.put("/me/avatar", authenticateTokenUser, requireRole(["user"]), upload.single("file"), UserController.updateAvatar);
router.put("/me/password", authenticateTokenUser, requireRole(["user"]), UserController.changePassword);

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.put("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.updateUser);
router.put("/:id/status", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.updateUserStatus);
router.delete("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), UserController.deleteUser);

export const userRoutes = router;

