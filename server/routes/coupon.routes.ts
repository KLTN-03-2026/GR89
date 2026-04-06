import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { CouponController } from "../controllers/coupon.controller";
import { uploadDocument } from "../middleware/upload.middleware";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/export", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.exportCouponData);
router.post("/import", authenticateTokenAdmin, requireRole(["admin", "content"]), uploadDocument.single("file"), CouponController.importCouponData);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.getAllCoupons);
router.put("/bulk/status", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.updateManyCouponsStatus);
router.post("/delete-many", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.deleteManyCoupons);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/validate", authenticateTokenUser, CouponController.validateCoupon);

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.post("/", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.createCoupon);
router.get("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.getCouponById);
router.put("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.updateCoupon);
router.delete("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.deleteCoupon);
router.put("/:id/status", authenticateTokenAdmin, requireRole(["admin", "content"]), CouponController.updateCouponStatus);

export const couponRoutes = router;
