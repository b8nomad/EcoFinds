import { Router } from 'express';
import { authenticate } from '#middlewares/auth.js';
import {
    getProfile,
    updateProfile,
    changePassword,
    getCart,
    addToCart,
    removeFromCart,
    createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getOrderHistory,
    getAllProducts,
    getProductById,
    createPurchase
} from './controllers.js';

import multer from 'multer';
import crypto from 'crypto';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = file.originalname.split('.').pop();
        cb(null, `${randomName}.${ext}`);
    }
});

const upload = multer({ storage: storage });

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// Cart Management
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:productId', removeFromCart);

// Product Management (as Seller)
router.post('/products', upload.single('image'), createProduct);
router.get('/my-products', getMyProducts);
router.put('/products/:productId', upload.single('image'), updateProduct);
router.delete('/products/:productId', deleteProduct);

// Order History
router.get('/orders', getOrderHistory);

// Product Browsing & Search
router.get('/products', getAllProducts);
router.get('/products/:productId', getProductById);

// Purchase
router.post('/purchase', createPurchase);

export default router;