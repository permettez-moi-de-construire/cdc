import { PrismaClient } from '@algar/theia-db'
import { PrismaService } from '../prisma.service'

export const defaultListAllowedParams = [
  'skip',
  'take',
  'cursor',
  'where',
  'orderBy',
] as const

export type DefaultListAllowedParams = typeof defaultListAllowedParams[number]
type ListWithAllowedParams = {
  [key in DefaultListAllowedParams]?: unknown
}

export type PickListAllowedParams<T extends ListWithAllowedParams> = Pick<
  T,
  DefaultListAllowedParams
>

export const defaultPrimaryKey = 'id'
export const defaultTimestamps = ['createdAt', 'updatedAt'] as const
export const defaultHiddenFields = [
  defaultPrimaryKey,
  ...defaultTimestamps,
] as const

export type DefaultHiddenFields = typeof defaultHiddenFields[number]
export type OmitHiddenFields<
  T,
  AdditionalHiddenFields extends '' | keyof T = '',
> = Omit<T, DefaultHiddenFields | AdditionalHiddenFields>

type PrismaClientDefaultProps = `$${string}`
type PrismaClientModelDelegateName = keyof Omit<
  PrismaClient,
  PrismaClientDefaultProps
>
type PrismaClientModelDelegate<
  ModelDelegateName extends PrismaClientModelDelegateName,
> = PrismaClient[ModelDelegateName]

type PrismaClientModel<
  ModelDelegateName extends PrismaClientModelDelegateName,
  ModelDelegate extends PrismaClientModelDelegate<ModelDelegateName> = PrismaClientModelDelegate<ModelDelegateName>,
> = Awaited<ReturnType<ModelDelegate['findUniqueOrThrow']>>

type PrismaWhereUniqueInput<
  ModelDelegateName extends PrismaClientModelDelegateName,
  ModelDelegate extends PrismaClientModelDelegate<ModelDelegateName> = PrismaClientModelDelegate<ModelDelegateName>,
> = NonNullable<Parameters<ModelDelegate['findUniqueOrThrow']>[0]>['where']

type PrismaFindManyArgs<
  ModelDelegateName extends PrismaClientModelDelegateName,
  ModelDelegate extends PrismaClientModelDelegate<ModelDelegateName> = PrismaClientModelDelegate<ModelDelegateName>,
> = NonNullable<Parameters<ModelDelegate['findMany']>[0]>

type PrismaCreateInput<
  ModelDelegateName extends PrismaClientModelDelegateName,
  ModelDelegate extends PrismaClientModelDelegate<ModelDelegateName> = PrismaClientModelDelegate<ModelDelegateName>,
> = NonNullable<Parameters<ModelDelegate['create']>[0]>['data']

type PrismaUpdateInput<
  ModelDelegateName extends PrismaClientModelDelegateName,
  ModelDelegate extends PrismaClientModelDelegate<ModelDelegateName> = PrismaClientModelDelegate<ModelDelegateName>,
> = NonNullable<Parameters<ModelDelegate['update']>[0]>['data']

export class BaseModel<
  ModelDelegateName extends PrismaClientModelDelegateName,
  ModelDelegate extends PrismaClientModelDelegate<ModelDelegateName> = PrismaClientModelDelegate<ModelDelegateName>,
  Model extends PrismaClientModel<
    ModelDelegateName,
    ModelDelegate
  > = PrismaClientModel<ModelDelegateName, ModelDelegate>,
> {
  private readonly prisma: PrismaService
  private readonly model: ModelDelegate
  constructor(prisma: PrismaService, modelDelegateName: ModelDelegateName) {
    this.prisma = prisma
    this.model = prisma[modelDelegateName] as ModelDelegate
  }

  async findMaybe<
    WhereUniqueInput extends PrismaWhereUniqueInput<ModelDelegateName>,
  >(whereUniqueInput: WhereUniqueInput): Promise<Model | null> {
    return (this.model.findUnique as any)({
      where: whereUniqueInput,
    })
  }

  async find<
    WhereUniqueInput extends PrismaWhereUniqueInput<ModelDelegateName>,
  >(whereUniqueInput: WhereUniqueInput): Promise<Model> {
    return (this.model.findUniqueOrThrow as any)({
      where: whereUniqueInput,
    })
  }

  async list<FindManyArgs extends PrismaFindManyArgs<ModelDelegateName>>(
    findManyArgs?: PickListAllowedParams<FindManyArgs>,
  ): Promise<Model[]> {
    return (this.model.findMany as any)(findManyArgs)
  }

  async create<CreateInput extends PrismaCreateInput<ModelDelegateName>>(
    data: OmitHiddenFields<CreateInput>,
  ): Promise<Model> {
    return (this.model.create as any)({
      data,
    })
  }

  async update<
    WhereUniqueInput extends PrismaWhereUniqueInput<ModelDelegateName>,
    UpdateInput extends PrismaUpdateInput<ModelDelegateName>,
  >(params: {
    where: WhereUniqueInput
    data: OmitHiddenFields<UpdateInput>
  }): Promise<Model> {
    const { data, where } = params
    return (this.model.update as any)({
      data,
      where,
    })
  }

  async delete<
    WhereUniqueInput extends PrismaWhereUniqueInput<ModelDelegateName>,
  >(where: WhereUniqueInput): Promise<Model> {
    return (this.model.delete as any)({
      where,
    })
  }
}
