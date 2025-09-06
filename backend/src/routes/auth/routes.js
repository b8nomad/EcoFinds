import { Router } from 'express';
import { login, signup } from '#auth/controllers.js';
import { authenticate } from '#middlewares/auth.js'

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/authenticate', authenticate, (req, res) => {
    if (req.user) {
        res.json({ success: true, data: req.user });
    } else {
        res.json({ success: false, message: 'User not authenticated' });
    }
});

export default router;