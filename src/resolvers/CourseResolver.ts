import { Arg, Float, Int, Mutation, Query, Resolver, Ctx, Root, FieldResolver, Info } from 'type-graphql'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { AuthenticationError, ApolloError } from 'apollo-server-express'
import Course from '../entities/Course'
import User from '../entities/User'

interface Context {
    user: string,
    role: string
}

function mapExistentRelations (infoObj: any, relations: Array<string>): string[] {
  const { fieldsByTypeName } = parseResolveInfo(infoObj) as any
  const searchedRelations = []
  for (const relation of relations) {
    let wasSearched = true
    const relationList = relation.split('.')
    let mainRelation = relationList[0]
    const subRelations = relationList.slice(1)
    let subfields = fieldsByTypeName[Object.keys(fieldsByTypeName)[0]]
    if (!subfields[mainRelation]) continue
    while (subRelations.length > 0) {
      subfields = subfields[mainRelation].fieldsByTypeName[Object.keys(subfields[mainRelation].fieldsByTypeName)[0]]
      if (!subfields[subRelations[0]]) {
        wasSearched = false
        break
      }
      mainRelation = subRelations[0]
      subRelations.shift()
    }
    if (wasSearched) searchedRelations.push(relation)
  }
  console.log(searchedRelations)
  return searchedRelations
}

@Resolver(Of => Course)
export default class CourseResolver {
  @Query(() => [Course])
  async courses (@Info() info: any) {
    const relations = mapExistentRelations(info, ['owner', 'students'])
    const courses = await Course.find({ relations })
    return courses
  }

  @Query(() => [Course])
  async joinedCourses (@Ctx() ctx: Context) {
    if (ctx.role === 'guest') {
      throw new AuthenticationError('Not allowed')
    }
    const user = await User.findOneOrFail({ relations: ['boughtCourses'], where: { username: ctx.user } })
    return user.boughtCourses
  }

  @FieldResolver(() => Int)
  async priceOf (@Arg('qtd') qtd: number, @Root() root: Course) {
    return root.basePrice * qtd
  }

  @Mutation(() => Course)
  async createCourse (@Arg('name') name: string, @Arg('basePrice', type => Float) basePrice: number, @Ctx() ctx: Context) {
    if (ctx.role === 'guest') {
      throw new AuthenticationError('Not allowed')
    }
    const user = await User.findOneOrFail({ where: { username: ctx.user } })
    const course = Course.create({ name, basePrice, owner: user })
    await course.save()
    return course
  }

  @Mutation(() => Course)
  async updateCourse (
      @Arg('courseId', type => Int) courseId: number,
      @Arg('name', { nullable: true }) name: string,
      @Arg('basePrice', { nullable: true }) basePrice:number,
      @Ctx() ctx: Context
  ) {
    if (ctx.role === 'guest') {
      throw new AuthenticationError('Not allowed')
    }
    const course = await Course.findOneOrFail({ id: courseId })
    if (course.owner.username !== ctx.user) {
      throw new AuthenticationError('Not allowed')
    }
    if (name) course.name = name
    if (basePrice) course.basePrice = basePrice
    await Course.save(course)
    return course
  }

  @Mutation(() => Boolean)
  async deleteCourse (
      @Arg('courseId', type => Int) courseId: number,
      @Ctx() ctx: Context
  ) {
    if (ctx.role === 'guest') {
      throw new AuthenticationError('Not allowed')
    }
    try {
      const course = await Course.findOneOrFail({ id: courseId })
      if (course.owner.username !== ctx.user) {
        throw new AuthenticationError('Not allowed')
      }
      await Course.delete(course)
      return true
    } catch {
      return false
    }
  }

  @Mutation(() => Course)
  async joinCourse (
      @Arg('courseId', type => Int) courseId: number,
      @Ctx() ctx: Context
  ) {
    if (ctx.role === 'guest') {
      throw new AuthenticationError('Not allowed')
    }
    const course = await Course.findOneOrFail({ relations: ['students'], where: { id: courseId } })
    if (course.owner.username === ctx.user) {
      throw new ApolloError("You can't join a course you own", 'CANT_JOIN')
    }

    const user = await User.findOneOrFail({ where: { username: ctx.user } })
    if (course.students.includes(user)) {
      throw new ApolloError("You can't join a course you own", 'CANT_JOIN')
    }
    course.students.push(user)
    await Course.save(course)
    return course
  }
}
