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

/*============================ QUẢN LÝ BÀI TẬP ============================*/

// Admin/Content: Giao bài, chấm bài, xóa bài, xem chi tiết
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

// User: Nộp bài
router.post(
  '/homework/:id/submit',
  authenticateTokenUser,
  requireRole(['user']),
  CenterClassController.submitHomework,
)

export const centerClassRoutes = router
