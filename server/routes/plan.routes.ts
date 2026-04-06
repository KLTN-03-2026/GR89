import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { PlanController } from "../controllers/plan.controller";
import { uploadDocument } from "../middleware/upload.middleware";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/export", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.exportPlanData);
router.post("/import", authenticateTokenAdmin, requireRole(["admin", "content"]), uploadDocument.single("file"), PlanController.importPlanData);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.getAllPlans);
router.put("/bulk/status", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.updateManyPlansStatus);
router.post("/delete-many", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.deleteManyPlans);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/active", PlanController.getActivePlans);

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.post("/", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.createPlan);
router.get("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.getPlanById);
router.put("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.updatePlan);
router.delete("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.deletePlan);
router.put("/:id/status", authenticateTokenAdmin, requireRole(["admin", "content"]), PlanController.updatePlanStatus);

export const planRoutes = router;
