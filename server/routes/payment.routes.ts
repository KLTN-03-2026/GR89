import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/


/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), PaymentController.getAllPayments);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/user", authenticateTokenUser, PaymentController.getUserPayments);
router.post("/create-url", authenticateTokenUser, PaymentController.createPaymentUrl);

//https://900a-2402-800-6e27-3bba-28e0-c926-865a-f07f.ngrok-free.app/webhook
router.post("/webhook", PaymentController.payOSWebhook)
/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.get("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), PaymentController.getPaymentById);

export const paymentRoutes = router;
