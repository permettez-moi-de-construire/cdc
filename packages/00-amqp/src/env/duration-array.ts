import { zodImplement, typeJSONValidator } from '@algar/theia-common'
import { z } from 'zod'

const durationArraySchema = z.array(
  zodImplement<Duration>()({
    years: z.number().optional(),
    months: z.number().optional(),
    weeks: z.number().optional(),
    days: z.number().optional(),
    hours: z.number().optional(),
    minutes: z.number().optional(),
    seconds: z.number().optional(),
  }),
)

export const durationArrayValidator = typeJSONValidator(
  durationArraySchema.parse,
)
