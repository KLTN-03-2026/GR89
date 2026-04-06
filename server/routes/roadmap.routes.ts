import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { RoadmapTopicController } from "../controllers/roadmapTopic.controller";

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get("/lessons/type", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.getLessonsByType);

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get("/topics", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.getAllTopics);
router.put("/topics/reorder", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.reorderTopics);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get("/user", authenticateTokenUser, RoadmapTopicController.getUserRoadmaps);

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.get("/topics/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.getTopicById);
router.get("/topics/:id/lessons", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.getTopicLessons);
router.post("/topics", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.createTopic);
router.put("/topics/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.updateTopic);
router.delete("/topics/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.deleteTopic);
router.put("/topics/:id/lessons/reorder", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.reorderLessons);
router.post("/topics/:id/lessons", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.addLessonToTopic);
router.delete("/topics/:topicId/lessons/:lessonId", authenticateTokenAdmin, requireRole(["admin", "content"]), RoadmapTopicController.removeLessonFromTopic);

export const roadmapRoutes = router;
