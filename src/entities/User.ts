import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToMany, JoinTable, OneToMany } from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Course from './Course'

@ObjectType()
@Entity('users')
class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    name: string

    @Field()
    @Column({ unique: true })
    username: string

    @Column()
    password: string

    @BeforeInsert()
    updatePassword () {
      this.password = bcrypt.hashSync(this.password, 10)
    }

    signToken () {
      return jwt.sign({ user: this.username }, process.env.JWT_SECRET, { expiresIn: '1 day' })
    }

    @Field(() => [Course], { nullable: true })
    @OneToMany(() => Course, course => course.owner)
    ownedCourses: Course[]

    @Field(() => [Course], { nullable: true })
    @ManyToMany(() => Course, course => course.students)
    @JoinTable()
    boughtCourses: Course[]
}

export default User
