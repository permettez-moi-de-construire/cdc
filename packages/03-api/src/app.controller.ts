import { ZodValidationPipe } from '@anatine/zod-nestjs'
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common'
import {
  BearDto,
  BearListDto,
  BearUpdateDto,
  BearCreationDto,
} from './rest/dtos/bear.dto'
import { BearModel } from './database/models/bear.model'

@Controller()
@UsePipes(ZodValidationPipe)
export class AppController {
  constructor(private readonly bearModel: BearModel) {}

  @Get()
  async findAll(): Promise<BearListDto> {
    return this.bearModel.list()
  }
  @Get(':id')
  async findOne(@Param() { id }: { id: string }): Promise<BearDto> {
    return this.bearModel.find({ id })
  }
  @Post()
  async create(@Body() createBearDto: BearCreationDto): Promise<BearDto> {
    return this.bearModel.create(createBearDto)
  }
  @Put()
  async update(
    @Param() { id }: { id: string },
    @Body() updateBearDto: BearUpdateDto,
  ): Promise<BearDto> {
    return this.bearModel.update({ where: { id }, data: updateBearDto })
  }
}
