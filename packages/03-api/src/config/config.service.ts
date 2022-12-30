import { Injectable } from '@nestjs/common'
import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  PORT: number
  DATABASE_URL: string
}

@Injectable()
export class ConfigService implements AppEnv {
  readonly NODE_ENV: KnownNodeEnv
  readonly PORT: number
  readonly DATABASE_URL: string

  constructor() {
    const appEnv = this.getAppEnv(process.env)
    Object.assign(this, appEnv)
  }

  private getAppEnv(env: NodeJS.ProcessEnv) {
    const cleanedEnv = envalid.cleanEnv<AppEnv>(env, {
      NODE_ENV: envalid.str({ choices: knownNodeEnv }),
      PORT: envalid.port(),
      DATABASE_URL: envalid.url(),
    })

    return { ...cleanedEnv } as CleanedEnv<AppEnv>
  }
}
