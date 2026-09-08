import express from 'express';
import {
  sendMessage,
  scheduleMessage,
  getMessages,
  getMessageById,
  getScheduledMessages,
  cancelScheduled,
  deleteScheduled,
  triggerSendNow,
  processQueueNow,
  getDeliveryLogs,
  deleteDeliveryLog,
  clearDeliveryLogs
} from '../controllers/messagesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/send', sendMessage);
router.post('/schedule', scheduleMessage);
router.get('/', getMessages);
router.get('/scheduled', getScheduledMessages);
router.post('/scheduled/process-queue', processQueueNow);
router.post('/scheduled/:id/send-now', triggerSendNow);
router.post('/scheduled/:id/cancel', cancelScheduled);
router.delete('/scheduled/clear-cancelled', (req, res) => {
  req.params.id = 'clear-cancelled';
  deleteScheduled(req, res);
});
router.delete('/scheduled/:id/cancel', cancelScheduled);
router.delete('/scheduled/:id', deleteScheduled);
router.get('/logs', getDeliveryLogs);
router.delete('/logs/clear', clearDeliveryLogs);
router.delete('/logs/:id', deleteDeliveryLog);
router.get('/:id', getMessageById);

export default router;

