import express from "express";
import { authenticateTokenAdmin, requireRole } from "../middleware/auth.middleware";
import { GlobalDocumentController } from "../controllers/globalDocument.controller";
import { DocumentCategoryController } from "../controllers/documentCategory.controller";

const router = express.Router();

/*============================ QUẢN LÝ DANH MỤC ============================*/

router.get("/categories", authenticateTokenAdmin, requireRole(["admin", "content"]), DocumentCategoryController.getAllCategories);
router.post("/categories", authenticateTokenAdmin, requireRole(["admin", "content"]), DocumentCategoryController.createCategory);
router.get("/categories/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), DocumentCategoryController.getCategoryById);
router.put("/categories/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), DocumentCategoryController.updateCategory);
router.delete("/categories/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), DocumentCategoryController.deleteCategory);

/*============================ QUẢN LÝ TÀI LIỆU ============================*/

router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.getAllDocuments);
router.post("/", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.createDocument);
router.post("/delete-many", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.deleteManyDocuments);
router.get("/:id/download", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.downloadDocx);
router.get("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.getDocumentById);
router.put("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.updateDocument);
router.delete("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), GlobalDocumentController.deleteDocument);

export const globalDocumentRoutes = router;
