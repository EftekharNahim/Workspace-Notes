import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy load controller
const UserController = () => import('./user.controller.js')
const TenantMiddleware = () => import('../../middleware/TenantMiddleware.js')

// Public routes
router.post('/register', [UserController, 'register'])
router.post('/login', [UserController, 'login'])

// Protected routes
router.group(() => {
  router.get('/me', [UserController, 'getMe'])
  router.post('/logout', [UserController, 'logout'])
  router.put('/users/:id', [UserController, 'update'])
}).middleware([TenantMiddleware,middleware.auth()])
