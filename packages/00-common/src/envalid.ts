import { makeValidator, EnvError, str } from 'envalid'
import TypeJSON, { JSONParser, JSONValue } from './json'
import { LogLevel, logLevels } from './log'

export const typeJSONValidator = <T extends JSONValue = JSONValue>(
  parser: JSONParser<T>,
) =>
  makeValidator((x) => {
    try {
      return TypeJSON.parse(x, parser)
    } catch (e) {
      throw new EnvError(`Invalid duration array JSON: "${x}"`)
    }
  })

export const logLevelValidator = (
  _logLevels: LogLevel[] = logLevels as unknown as LogLevel[],
) => str({ choices: _logLevels })
