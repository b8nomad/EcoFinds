import { Router } from 'express';

import user_routes from './routes/user/routes.js';
import auth_routes from './routes/auth/routes.js';
import admin_routes from './routes/admin/routes.js';

const router = Router();

router.use('/user', user_routes);
router.use('/auth', auth_routes);
router.use('/admin', admin_routes);

export default router;