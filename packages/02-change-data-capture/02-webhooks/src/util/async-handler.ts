import type { ParamsDictionary, Query } from 'express-serve-static-core'

import {
  RequestHandler,
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express'

type AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<void>

type ResDescriptor<ResBody> = {
  statusCode?: number
  contentType?: string
  body: ResBody
}

type AsyncManagedRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
) => Promise<ResDescriptor<ResBody>>

type AsyncErrorManagedRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Err = unknown,
> = (
  err: Err,
  req: Request<P, ResBody, ReqBody, ReqQuery>,
) => Promise<ResDescriptor<ResBody>>

type AsyncErrorRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Err = unknown,
> = (
  err: Err,
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<void>

const createAsyncHandler = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => {
    handler(req, res, next).catch(next)
  }
}

const createAsyncManagedHandler = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
>(
  handler: AsyncManagedRequestHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => {
    handler(req)
      .then(({ statusCode = 200, contentType = 'application/json', body }) => {
        res.type(contentType)
        res.status(statusCode)
        res.send(body)
      })
      .catch(next)
  }
}

const createAsyncErrorHandler = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Err = unknown,
>(
  handler: AsyncErrorRequestHandler<P, ResBody, ReqBody, ReqQuery, Err>,
): ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (
    err: Err,
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => {
    handler(err, req, res, next).catch(next)
  }
}

const createAsyncManagedErrorHandler = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Err = unknown,
>(
  handler: AsyncErrorManagedRequestHandler<P, ResBody, ReqBody, ReqQuery, Err>,
): ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (
    err: Err,
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => {
    handler(err, req)
      .then(({ statusCode = 500, contentType = 'application/json', body }) => {
        res.type(contentType)
        res.status(statusCode)
        res.send(body)
      })
      .catch(next)
  }
}

export {
  createAsyncHandler,
  createAsyncErrorHandler,
  createAsyncManagedHandler,
  createAsyncManagedErrorHandler,
}
export type {
  ResDescriptor,
  AsyncRequestHandler,
  AsyncErrorRequestHandler,
  AsyncManagedRequestHandler,
  AsyncErrorManagedRequestHandler,
}
