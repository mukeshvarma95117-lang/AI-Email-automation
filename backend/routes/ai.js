import express from 'express';
import { generate, rewrite, translate, previewPersonalization } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/generate', generate);
router.post('/rewrite', rewrite);
router.post('/translate', translate);
router.post('/preview', previewPersonalization);

export default router;

