import { app } from '../../src/server'
import User from '../../src/entities/User'
import truncateTable from './utils/truncateTable'
import { createConnection } from 'typeorm'
import request from 'supertest'

describe('User', () => {
  beforeAll(async () => {
    await createConnection()
  })

  beforeEach(async () => {
    await truncateTable()
  })
  it('Should not authenticate with invalid credentials', async () => {
    const data = { name: 'Jao Qusdadrosgfs', password: '123456', username: 'JanisdfddfdfdfsdfgosdsdggfgsZ' }
    const user = User.create(data)
    await user.save()
    const response = await request(app)
      .post('/login')
      .send({ ...data, password: '12345' })

    expect(response.status).toBe(400)
  })

  it('Should authenticate valid credentials', async () => {
    const data = { name: 'Jao Qusdadrosgfs', password: '123456', username: 'JanisdfddfdfdfsdfgosdsdggfgsZ' }
    const user = User.create(data)
    await user.save()
    const response = await request(app)
      .post('/login')
      .send(data)

    expect(response.body).toHaveProperty('token')
  })

  it('Should not authorize users in secured routes without authorization headers', async () => {
    const response = await request(app)
      .get('/authorizedonly')

    expect(response.status).toBe(401)
  })

  it('Should not authorize users in secured routes without valid tokens', async () => {
    const response = await request(app)
      .get('/authorizedonly')
      .set('Authorization', 'BEARER DSFKJKJ3JKDF')

    expect(response.status).toBe(401)
  })
  it('Should authorize users in secured routes with valid tokens', async () => {
    const data = { name: 'Jao Qusdadrosgfs', password: '123456', username: 'JanisdfddfdfdfsdfgosdsdggfgsZ' }
    const user = User.create(data)
    await user.save()
    const token = user.signToken()
    console.log(token)

    const response = await request(app)
      .get('/authorizedonly')
      .set('Authorization', `BEARER ${token}`)

    expect(response.body).toHaveProperty('user')
  })
})
