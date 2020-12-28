import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface tokenPayload {
    user: string
}

export default async (req: Request, res: Response, next: NextFunction) => {
  if (req.url === '/graphql') return next()

  const { authorization } = req.headers
  if (!authorization) return res.status(401).json({ error: ['Forbidden'] })
  const token = authorization.replace('BEARER ', '')
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded: tokenPayload) => {
    if (err || !decoded) return res.status(401).json({ error: ['Forbidden'] })
    req.username = decoded.user
    return next()
  })
}
