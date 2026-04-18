import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.post("/vnpay/callback", PaymentController.vnpayCallback);
router.get("/vnpay/callback", PaymentController.vnpayCallback);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), PaymentController.getAllPayments);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/user", authenticateTokenUser, PaymentController.getUserPayments);
router.post("/create-url", authenticateTokenUser, PaymentController.createPaymentUrl);

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.get("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), PaymentController.getPaymentById);

export const paymentRoutes = router;
