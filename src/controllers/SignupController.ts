import { Request, Response } from 'express'
import User from '../entities/User'

class SignupController {
  async store (req: Request, res: Response) {
    const { name, username, password, confirmPassword } = req.body
    if (password !== confirmPassword) return res.status(400).json({ error: ['Passwords do not match'] })
    const user = User.create({ name, username, password })
    try {
      await user.save()
      return res.json({ message: 'Cadastro realizado com sucesso!' })
    } catch {
      return res.status(500).json({ error: ['Erro interno'] })
    }
  }
}

export default new SignupController()
