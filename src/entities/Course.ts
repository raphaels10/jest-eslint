import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from 'typeorm'
import { ObjectType, Field, ID, Float } from 'type-graphql'
import User from './User'

@ObjectType()
@Entity()
export default class Course extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number

    @Field({ nullable: true })
    @Column()
    name: string

    @Field(() => Float, { nullable: true })
    @Column()
    basePrice: number

    @Field(() => User, { nullable: true })
    @ManyToOne(() => User, user => user.ownedCourses)
    owner: User

    @Field(() => [User], { nullable: true })
    @ManyToMany(() => User, student => student.boughtCourses)
    students: User[]
}
