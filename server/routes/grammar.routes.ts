import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { checkVipContentUser } from "../middleware/content.middleware";
import { GrammarController } from "../controllers/grammar.controller";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/overview", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.getOverviewStats);
router.get("/user-stats", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.getUserStats);
router.get("/time-series", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.getTimeSeriesStats);
router.get("/export", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.exportGrammarData);
router.post("/import-json", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.importGrammarJson);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.getAllGrammarTopics);
router.put("/status", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.updateManyGrammarTopicsStatus);
router.delete("/bulk-delete", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.deleteManyGrammarTopics);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/user", authenticateTokenUser, requireRole(["user"]), GrammarController.getAllTopicsByUser);
router.get("/topic-user/:id/quizzes", authenticateTokenUser, requireRole(["user"]), checkVipContentUser("grammar"), GrammarController.getGrammarQuizForUser);
router.post(
  "/quizzes/:id/do",
  authenticateTokenUser,
  requireRole(["user"]),
  checkVipContentUser("grammar"),
  GrammarController.doGrammarQuiz
);

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.post("/", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.createGrammarTopic);
router.get("/:id", GrammarController.getGrammarTopicById);
router.get("/:id/stats", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.getGrammarTopicStats);
router.put("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.updateGrammarTopic);
router.delete("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.deleteGrammarTopic);
router.put("/:id/status", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.toggleGrammarTopicStatus);
router.patch("/:id/vip", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.toggleGrammarTopicVip);
router.patch("/:id/swap-order", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.swapGrammarTopicOrder);
router.put("/:id/sections", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.updateGrammarSections);
router.put("/:id/practice", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.updateGrammarPractice);
router.put("/:id/quizzes", authenticateTokenAdmin, requireRole(["admin", "content"]), GrammarController.updateGrammarQuizzes);

export const grammarRoutes = router;
