import request from 'supertest'
import { app } from '../../src/server'
import User from '../../src/entities/User'
// import Course from '../../src/entities/Course'
import { createConnection, getConnection } from 'typeorm'

describe('Course', () => {
  // let query: any
  let mutation: any

  beforeAll(async () => {
    await createConnection()
  })

  afterAll(async () => {
    await getConnection().close()
  })

  /* it("Should not allow you to see your bought courses if you're not logged in", async () => {
    query = { query: 'query{courses{name}}' }
    console.log(query)
    const response = await request(app).post('/graphql')
      .send(query)
    console.log(response.body.data)
    expect(2).toBe(2)
  }) */

  it('Should not allow to create a course if not logged in', async () => {
    const course = 'Python Essencial'
    mutation = `mutation createCourse($name: String!, $basePrice: Float!){
      createCourse(name: $name, basePrice: $basePrice) {
        name
      }
    }`
    const response = await request(app)
      .post('/graphql')
      .send({ query: mutation, variables: { name: course, basePrice: 19.90 } })
    expect(response.body.errors[0].message).toBe('Not allowed')
  })

  it('Should allow to create a course if authenticated with a bearer token', async () => {
    mutation = `mutation {createCourse(name: "Python Essencial", basePrice: 19.90){
      name
    }}`

    const user = User.create({ name: 'Raphael', username: 'Raphaels10', password: '123456' })
    await user.save()
    const token = user.signToken()

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `BEARER ${token}`)
      .send({ query: mutation })

    console.log(response.body)

    expect(response.body.data.createCourse.name).toBe('Python Essencial')
  })
})
