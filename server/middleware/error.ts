/*
Khi CatchAsyncError gọi next(error), lỗi được đưa đến ErrorMiddleware.
ErrorMiddleware sẽ kiểm tra lỗi, xử lý nó và gửi phản hồi lỗi về cho client.
Nếu không có CatchAsyncError, các lỗi async sẽ không được chuyển đến ErrorMiddleware, khiến server bị crash.
*/

import { Request, Response, NextFunction } from 'express'
import ErrorHandler from '../utils/ErrorHandler'

export const ErrorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  let customError = error

  customError.statusCode = error.statusCode || 500
  customError.message = error.message || 'Internal server error'

  // Lỗi ID MongoDB không đúng
  if (error.name === 'CastError') {
    const message = `Resource not found. Invalid: ${error.path}`
    customError = new ErrorHandler(message, 400)
  }

  // Lỗi trùng lặp key
  if (error.code === 11000) {
    const message = `Duplicate ${Object.keys(error.keyValue)} entered`
    customError = new ErrorHandler(message, 400)
  }

  // Lỗi JWT không đúng
  if (error.name === 'JsonWebTokenError') {
    const message = 'Json web token is invalid, try again'
    customError = new ErrorHandler(message, 400)
  }

  // Lỗi JWT hết hạn
  if (error.name === 'TokenExpiredError') {
    const message = 'Json web token is expired, try again'
    customError = new ErrorHandler(message, 400)
  }

  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
  })
}
