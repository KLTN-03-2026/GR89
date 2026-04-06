/*
CatchAsyncError giúp bọc các hàm async, nếu có lỗi xảy ra, 
nó sẽ không xử lý lỗi mà chỉ chuyển lỗi đến chuyển lỗi sang ErrorMiddleware để xử lý
*/

import { Request, Response, NextFunction } from 'express'

export const CatchAsyncError =
  (theFunc: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next)
  }
