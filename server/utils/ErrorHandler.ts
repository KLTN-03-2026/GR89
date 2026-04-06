// ErrorHandler giúp tạo lỗi có message + statusCode.
// Kế thừa từ Error, nên có thể dùng như một lỗi thông thường.
// Kết hợp với ErrorMiddleware để xử lý lỗi trong Express dễ dàng hơn.

class ErrorHandler extends Error {
  statusCode: number

  constructor(message: any, statusCode: number) {
    super(message)
    this.statusCode = statusCode

    Error.captureStackTrace(this, this.constructor)
  }
}

export default ErrorHandler
