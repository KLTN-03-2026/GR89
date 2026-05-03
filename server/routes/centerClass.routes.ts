import express from 'express'
import { CenterClassController } from '../controllers/centerClass.controller'
import {
  authenticateTokenAdmin,
  authenticateTokenUser,
  requireRole,
} from '../middleware/auth.middleware'

const router = express.Router()

/*============================ QUẢN LÝ LỚP HỌC ============================*/

router.post(
  '/',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.createClass,
)
router.get(
  '/',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.getAllClasses,
)
router.get(
  '/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.getClassById,
)
router.put(
  '/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.updateClass,
)
router.delete(
  '/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.deleteClass,
)

/*============================ QUẢN LÝ HỌC SINH ============================*/

router.post(
  '/:id/students',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.addStudent,
)
router.delete(
  '/:id/students/:userId',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.removeStudent,
)

/*============================ QUẢN LÝ TÀI LIỆU ============================*/

router.post(
  '/:id/documents',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.addDocument,
)

router.get(
  '/:id/documents',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.getDocuments,
)

router.put(
  '/:id/documents',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.setDocuments,
)

router.delete(
  '/:id/documents/:documentId',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.removeDocument,
)

/*============================ QUẢN LÝ BÀI TẬP ============================*/

// Admin/Content: Giao bài, chấm bài, xóa bài, xem chi tiết
router.get(
  '/:id/homeworks',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.getHomeworks,
)
router.post(
  '/:id/homeworks',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.createHomeworkForClass,
)
router.delete(
  '/:id/homeworks/:homeworkId',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.deleteHomeworkForClass,
)

router.post(
  '/homework',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.createHomework,
)
router.post(
  '/homework/:id/grade',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.gradeHomework,
)
router.delete(
  '/homework/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.deleteHomework,
)
router.get(
  '/homework/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.getHomeworkById,
)
router.put(
  '/homework/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  CenterClassController.updateHomework,
)

// User: Nộp bài
router.post(
  '/homework/:id/submit',
  authenticateTokenUser,
  requireRole(['user']),
  CenterClassController.submitHomework,
)

export const centerClassRoutes = router
