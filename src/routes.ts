import { Router } from 'express'
import SignupController from './controllers/SignupController'
import LoginController from './controllers/LoginController'
import UserInfoController from './controllers/UserInfoController'

import authMiddleware from './middlewares/restAuthMiddleware'

const routes = Router()

routes.route('/login')
  .post(LoginController.store)

routes.route('/signup')
  .post(SignupController.store)

// Secured Routes
routes.use(authMiddleware)
routes.route('/authorizedonly')
  .get(UserInfoController.index)

export default routes
