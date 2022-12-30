import { createZodDto, ZodDtoStatic } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { Bear } from '@algar/theia-db'
import { z } from 'zod'
import { implement } from './util'

// Base schemas
export const BearZ = implement<Bear>()({
  id: z.string(),
  nickName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const BearListZ = z.array(BearZ)
export const BearCreationZ = BearZ.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const BearUpdateZ = BearCreationZ.partial()

// OpenAPI Schemas
export const BearOAZ = extendApi(BearZ, {
  description: 'A bear',
})
export const BearListOAZ = extendApi(BearListZ, {
  description: 'A list of bear',
})
export const BearCreationOAZ = extendApi(BearCreationZ, {
  title: 'BearCreation',
  description: 'A bear creation payload',
})
export const BearUpdateOAZ = extendApi(BearUpdateZ, {
  title: 'BearUpdate',
  description: 'A bear update payload',
})

// DTOs
export class BearDto extends createZodDto(BearZ) {}
export class BearListDto extends createZodDto(BearListZ) {}
export class BearCreationDto extends createZodDto(BearCreationZ) {}
export class BearUpdateDto extends createZodDto(BearUpdateZ) {}
