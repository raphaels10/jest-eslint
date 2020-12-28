import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import User from '../entities/User'

class LoginController {
  async store (req: Request, res: Response) {
    console.log(req.files)
    const { username, password } = req.body
    try {
      const user = await User.findOneOrFail({ where: { username } })
      const isSamePass = await bcrypt.compare(password, user.password)
      if (!isSamePass) return res.status(400).json({ error: ['Usuário ou senha inválidos'] })
      const token = user.signToken()
      return res.status(200).json({ username: user.username, token })
    } catch {
      return res.status(400).json({ error: ['Usuário ou senha inválidos'] })
    }
  }
}

export default new LoginController()
