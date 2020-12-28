import express from 'express'
import dotenv from 'dotenv'
import routes from './routes'

import { ApolloServer } from 'apollo-server-express'
import { buildSchemaSync } from 'type-graphql'
import depthLimit from 'graphql-depth-limit'

import CourseResolver from './resolvers/CourseResolver'
import graphqlAuthMiddleware from './middlewares/graphqlAuthMiddleware'

import { createConnection } from 'typeorm'

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

let server = null
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(routes)

async function main () {
  await createConnection()
  const schema = buildSchemaSync({ resolvers: [CourseResolver] })
  server = new ApolloServer({ validationRules: [depthLimit(10)], schema, context: ({ req, res }) => graphqlAuthMiddleware(req, res) })
  server.applyMiddleware({ app })
}

main()

export { app, server }
