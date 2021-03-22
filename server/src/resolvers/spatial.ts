import { prisma } from '.prisma/client'
import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from 'type-graphql'
import { Context } from '../context'

@Resolver()
export class SpatialResolver {
  @Mutation(() => Boolean)
  async postSpatial(
    @Arg('answers', () => [String]) answers: string[],
    @Ctx() { prisma }: Context
  ): Promise<boolean> {
    await prisma.spatialActivity.create({ data: { answers } })

    return true
  }
}
