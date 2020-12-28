import { Request, Response } from 'express'
import User from '../entities/User'

class UserInfoController {
  async index (req: Request, res: Response) {
    const username = req.username
    const user = await User.findOne({ where: { username } })
    if (!user) return res.status(400).json({ error: ['User not found'] })
    return res.json({ user })
  }
}

export default new UserInfoController()
