import express from 'express';
import { getSettings, updateSettings, testLlmConnection, testChannel, verifySmtp, setupTestSmtp, verifyResend } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-llm', testLlmConnection);
router.post('/test-channel', testChannel);
router.post('/verify-smtp', verifySmtp);
router.post('/verify-resend', verifyResend);
router.post('/setup-test-smtp', setupTestSmtp);

export default router;

