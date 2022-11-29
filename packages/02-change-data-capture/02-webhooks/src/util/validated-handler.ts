import { processRequest } from 'zod-express-middleware'
import { RequestHandler } from 'express'
import { z, ZodType } from 'zod'
import {
  AsyncManagedRequestHandler,
  AsyncRequestHandler,
  createAsyncHandler,
  createAsyncManagedHandler,
} from './async-handler'

const createVh =
  <
    TVParams = unknown,
    TVQuery = unknown,
    TVBody = unknown,
    ZVParams extends ZodType<TVParams> = ZodType<TVParams>,
    ZVQuery extends ZodType<TVQuery> = ZodType<TVQuery>,
    ZVBody extends ZodType<TVBody> = ZodType<TVBody>,
  >(schemas: {
    params?: ZVParams
    query?: ZVQuery
    body?: ZVBody
  }) =>
  <
    ResBody = unknown,
    P = z.infer<ZVParams>,
    ReqBody = z.infer<ZVBody>,
    ReqQuery = z.infer<ZVQuery>,
  >(
    handler: RequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ): [
    RequestHandler<TVParams, unknown, TVBody, TVQuery>,
    RequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ] =>
    [processRequest(schemas), handler]

const createVah =
  <
    TVParams = unknown,
    TVQuery = unknown,
    TVBody = unknown,
    ZVParams extends ZodType<TVParams> = ZodType<TVParams>,
    ZVQuery extends ZodType<TVQuery> = ZodType<TVQuery>,
    ZVBody extends ZodType<TVBody> = ZodType<TVBody>,
  >(schemas: {
    params?: ZVParams
    query?: ZVQuery
    body?: ZVBody
  }) =>
  <
    ResBody = unknown,
    P = z.infer<ZVParams>,
    ReqBody = z.infer<ZVBody>,
    ReqQuery = z.infer<ZVQuery>,
  >(
    handler: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ): [
    RequestHandler<TVParams, unknown, TVBody, TVQuery>,
    RequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ] =>
    [processRequest(schemas), createAsyncHandler(handler)]

const createVmah =
  <
    TVParams = unknown,
    TVQuery = unknown,
    TVBody = unknown,
    TVResBody = unknown,
    ZVParams extends ZodType<TVParams> = ZodType<TVParams>,
    ZVQuery extends ZodType<TVQuery> = ZodType<TVQuery>,
    ZVBody extends ZodType<TVBody> = ZodType<TVBody>,
    ZVResBody extends ZodType<TVResBody> = ZodType<TVResBody>,
  >(schemas: {
    params?: ZVParams
    query?: ZVQuery
    body?: ZVBody
    res?: ZVResBody
  }) =>
  <
    ResBody = z.infer<ZVResBody>,
    P = z.infer<ZVParams>,
    ReqBody = z.infer<ZVBody>,
    ReqQuery = z.infer<ZVQuery>,
  >(
    handler: AsyncManagedRequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ): [
    RequestHandler<TVParams, unknown, TVBody, TVQuery>,
    RequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ] =>
    [processRequest(schemas), createAsyncManagedHandler(handler)]

const createEndpoint = createVmah

export { createEndpoint, createVh, createVah, createVmah }
