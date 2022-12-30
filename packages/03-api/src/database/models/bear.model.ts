import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { BaseModel } from './base.model'

@Injectable()
export class BearModel extends BaseModel<'bear'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'bear')
  }
}
