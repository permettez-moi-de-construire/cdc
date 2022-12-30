import { z } from 'zod'

// Infer schema type from object
// See https://github.com/colinhacks/zod/issues/372#issuecomment-1280054492
export type Implements<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
    ? z.ZodNullableType<z.ZodType<Model[key]>>
    : z.ZodType<Model[key]>
}

export function implement<Model = never>() {
  return <
    Schema extends Implements<Model> & {
      [unknownKey in Exclude<keyof Schema, keyof Model>]: never
    },
  >(
    schema: Schema,
  ) => z.object(schema)
}
