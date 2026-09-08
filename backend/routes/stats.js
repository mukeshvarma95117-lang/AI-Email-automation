import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getDashboardStats);

export default router;

