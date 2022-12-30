import { Module } from '@nestjs/common'
import { BearModel } from './models/bear.model'
import { PrismaService } from './prisma.service'

@Module({
  providers: [PrismaService, BearModel],
  exports: [BearModel],
})
export class DatabaseModule {}
