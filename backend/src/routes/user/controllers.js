import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 1. Profile Management
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                location: true,
                image_url: true,
                created_at: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email, location, image_url } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, email, location, image_url },
            select: {
                id: true,
                name: true,
                email: true,
                location: true,
                image_url: true,
                created_at: true,
                role: true
            }
        });

        res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedNewPassword }
        });

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 2. Cart Management
export const getCart = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { cart_id: true }
        });

        if (user.cart_id.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const cartItems = await prisma.product.findMany({
            where: {
                id: { in: user.cart_id },
                status: 'ACTIVE'
            }
        });

        res.json({ success: true, data: cartItems });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product || product.status !== 'ACTIVE') {
            return res.status(404).json({ success: false, message: "Product not found or not available" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { cart_id: true }
        });

        if (user.cart_id.includes(productId)) {
            return res.status(400).json({ success: false, message: "Product already in cart" });
        }

        await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                cart_id: [...user.cart_id, productId]
            }
        });

        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { cart_id: true }
        });

        const updatedCart = user.cart_id.filter(id => id !== productId);

        await prisma.user.update({
            where: { id: req.user.userId },
            data: { cart_id: updatedCart }
        });

        res.json({ success: true, message: "Product removed from cart" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 3. Product Management (as a Seller)
export const createProduct = async (req, res) => {
    try {
        const { name, description, category, price, image_url } = req.body;

        if (!name || !description || !category || !price) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        const product = await prisma.product.create({
            data: {
                seller_id: req.user.userId,
                name,
                description,
                category,
                price: parseFloat(price),
                image_url,
                status: 'UNDER_REVIEW'
            }
        });

        res.status(201).json({ success: true, message: "Product created successfully", data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { seller_id: req.user.userId },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, category, price, image_url } = req.body;

        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                seller_id: req.user.userId
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or you don't have permission" });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { name, description, category, price: price ? parseFloat(price) : undefined, image_url }
        });

        res.json({ success: true, message: "Product updated successfully", data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                seller_id: req.user.userId
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or you don't have permission" });
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 4. Order History
export const getOrderHistory = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { user_id: req.user.userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image_url: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 5. Product Browsing & Search
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        
        const where = {
            status: 'ACTIVE'
        };

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            location: true
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNext: skip + parseInt(limit) < totalCount,
                    hasPrev: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 6. Create Purchase (Checkout)
export const createPurchase = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ success: false, message: "Product IDs are required" });
        }

        // Verify all products exist and are available
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                status: 'ACTIVE'
            }
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ success: false, message: "Some products are not available" });
        }

        // Create orders for each product
        const orders = await Promise.all(
            productIds.map(productId =>
                prisma.order.create({
                    data: {
                        user_id: req.user.userId,
                        product_id: productId,
                        status: 'PENDING'
                    },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                })
            )
        );

        // Update product status to SOLD
        await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { status: 'SOLD' }
        });

        // Clear cart
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { cart_id: true }
        });

        const updatedCart = user.cart_id.filter(id => !productIds.includes(id));

        await prisma.user.update({
            where: { id: req.user.userId },
            data: { cart_id: updatedCart }
        });

        res.status(201).json({ 
            success: true, 
            message: "Purchase created successfully", 
            data: orders 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};