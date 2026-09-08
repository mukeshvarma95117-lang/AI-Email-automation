import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  importCsv,
  exportContacts
} from '../controllers/contactsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getContacts);
router.get('/export', exportContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/import-csv', importCsv);

export default router;

