import { Router } from 'express'
import { authenticate } from '#middlewares/auth.js'
import { PrismaClient } from '@prisma/client'
import {
  listProducts,
  updateProductStatus,
  updateProductFields,
  listUsers,
  updateUserRole,
  listOrders,
  updateOrderStatus,
  getMetrics
} from './controller.js'

const prisma = new PrismaClient()
const router = Router()

// Admin guard
const ensureAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { role: true } })
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    next()
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
  }
}

// Apply middlewares
router.use(authenticate, ensureAdmin)

// Product moderation
router.get('/products', listProducts)
router.put('/products/:productId/status', updateProductStatus)
router.put('/products/:productId', updateProductFields)

// User management
router.get('/users', listUsers)
router.put('/users/:userId/role', updateUserRole)

// Order oversight
router.get('/orders', listOrders)
router.put('/orders/:orderId/status', updateOrderStatus)

// Analytics
router.get('/metrics', getMetrics)

export default router
