import chalk, { Chalk } from 'chalk'
import { getLogger, LogLevelNames as LogLevel, MethodFactory } from 'loglevel'

// TRACE: 0;
// DEBUG: 1;
// INFO: 2;
// WARN: 3;
// ERROR: 4;
// SILENT: 5;

export const logLevels: (LogLevel | 'silent')[] = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'silent',
]

const logLevelMethodColors: Record<LogLevel, Chalk> = {
  trace: chalk.cyan,
  debug: chalk.cyan,
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red,
}

const logLevelColors: Record<LogLevel, Chalk> = {
  trace: chalk.whiteBright,
  debug: chalk.white,
  info: chalk.whiteBright,
  warn: chalk.whiteBright,
  error: chalk.whiteBright,
}

export const createLogger = (name: string | symbol, logLevel: LogLevel) => {
  const logger = getLogger(name)
  logger.methodFactory = colorPrefixFactory(logger.methodFactory)
  logger.setLevel(logLevel)

  return logger
}

const colorPrefixFactory = (originalFactory: MethodFactory): MethodFactory => {
  const newFactory: MethodFactory = (methodName, logLevel, loggerName) => {
    const originalMethod = originalFactory(methodName, logLevel, loggerName)

    return (...msg: unknown[]) => {
      const newMsg = msg.map((message) => {
        const levelMethodColor = logLevelMethodColors[methodName]
        const levelColor = logLevelColors[methodName]
        const styledMethodName =
          levelMethodColor != null ? levelMethodColor(methodName) : methodName
        const styledMessage = levelColor != null ? levelColor(message) : message
        return `${styledMethodName} ${styledMessage}`
      })
      originalMethod(...newMsg)
    }
  }
  return newFactory
}

export type { LogLevel }
