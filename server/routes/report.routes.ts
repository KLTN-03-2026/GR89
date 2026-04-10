import express from "express";
import { authenticateTokenAdmin, requireRole } from "../middleware/auth.middleware";
import { ReportController } from "../controllers/report.controller";

const router = express.Router();

router.get(
  "/dashboard",
  authenticateTokenAdmin,
  requireRole(["admin", "content"]),
  ReportController.getDashboardReport
);

export const reportRoutes = router;

