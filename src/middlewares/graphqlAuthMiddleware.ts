import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface tokenPayload {
    user: string
}

export default function graphqlAuthMiddleware (req: Request, res: Response) {
  let user = {}
  const { authorization } = req.headers
  if (!authorization) return { ...user, role: 'guest' }

  const token = authorization.replace('BEARER ', '')
  if (!token) return { ...user, role: 'guest' }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as tokenPayload
    user = { user: decoded.user, role: 'user' }
    return user
  } catch (e) {
    return { ...user, role: 'guest' }
  }
}
