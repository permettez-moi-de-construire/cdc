import { equal } from 'lauqe'

export const µsToDate = (µs: bigint): Date => new Date(Number(µs / 1000n))

export const compileShallowChanges = <T extends Record<string, unknown>>(
  oldVal: T,
  newVal: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(newVal).filter(([k, v]) => !equal(v, oldVal[k])),
  ) as Partial<T>
