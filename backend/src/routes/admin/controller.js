import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Products
export const listProducts = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query
        const where = {}
        if (status) where.status = status
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ]
        }
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    seller: { select: { id: true, name: true, email: true, image_url: true } }
                }
            }),
            prisma.product.count({ where })
        ])
        res.json({ success: true, data: { products, total, page: parseInt(page) } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

export const updateProductStatus = async (req, res) => {
    try {
        const { productId } = req.params
        const { status } = req.body
        const allowed = ['UNDER_REVIEW', 'ACTIVE', 'INACTIVE', 'SOLD']
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' })
        }
        const updated = await prisma.product.update({
            where: { id: productId },
            data: { status }
        })
        res.json({ success: true, message: 'Product status updated', data: updated })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

export const updateProductFields = async (req, res) => {
    try {
        const { productId } = req.params
        const { name, description, price, category } = req.body
        const data = {
            ...(name ? { name } : {}),
            ...(description ? { description } : {}),
            ...(category ? { category } : {}),
            ...(price ? { price: parseFloat(price) } : {})
        }
        const updated = await prisma.product.update({ where: { id: productId }, data })
        res.json({ success: true, message: 'Product updated', data: updated })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// Users
export const listUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query
        const where = {}
        if (role) where.role = role
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const users = await prisma.user.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { created_at: 'desc' },
            select: { id: true, name: true, email: true, role: true, image_url: true, created_at: true }
        })
        // counts (simple approach)
        const withCounts = await Promise.all(users.map(async u => {
            const [productCount, orderCount] = await Promise.all([
                prisma.product.count({ where: { seller_id: u.id } }),
                prisma.order.count({ where: { user_id: u.id } })
            ])
            return { ...u, productCount, orderCount }
        }))
        const total = await prisma.user.count({ where })
        res.json({ success: true, data: { users: withCounts, total, page: parseInt(page) } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params
        const { role } = req.body
        const allowed = ['USER', 'ADMIN']
        if (!allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' })
        const updated = await prisma.user.update({ where: { id: userId }, data: { role } })
        res.json({ success: true, message: 'User role updated', data: updated })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// Orders
export const listOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query
        const where = {}
        if (status) where.status = status
        if (search) {
            const q = String(search)
            where.OR = [
                { product: { name: { contains: q, mode: 'insensitive' } } },
                { user: { name: { contains: q, mode: 'insensitive' } } },
                { user: { email: { contains: q, mode: 'insensitive' } } },
                { product: { seller: { name: { contains: q, mode: 'insensitive' } } } },
                { product: { seller: { email: { contains: q, mode: 'insensitive' } } } },
            ]
        }
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    product: { select: { id: true, name: true, price: true, seller_id: true, image_url: true } },
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            prisma.order.count({ where })
        ])
        // fetch sellers
        const sellerIds = [...new Set(orders.map(o => o.product?.seller_id).filter(Boolean))]
        const sellers = await prisma.user.findMany({
            where: { id: { in: sellerIds } },
            select: { id: true, name: true, email: true }
        })
        const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s]))
        const withSeller = orders.map(o => ({ ...o, seller: sellerMap[o.product?.seller_id] || null }))
        res.json({ success: true, data: { orders: withSeller, total, page: parseInt(page) } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const allowed = ['PENDING', 'COMPLETED', 'CANCELLED']
        if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' })
        const updated = await prisma.order.update({ where: { id: orderId }, data: { status } })
        res.json({ success: true, message: 'Order status updated', data: updated })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// Metrics
export const getMetrics = async (_req, res) => {
    try {
        const [productTotals, usersCount, ordersCount, topCategories] = await Promise.all([
            prisma.product.groupBy({ by: ['status'], _count: { _all: true } }),
            prisma.user.count(),
            prisma.order.count(),
            prisma.product.groupBy({
                by: ['category'],
                _count: { _all: true },
                orderBy: { _count: { _all: 'desc' } },
                take: 5
            })
        ])
        res.json({
            success: true,
            data: {
                productTotals,
                usersCount,
                ordersCount,
                topCategories
            }
        })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}
