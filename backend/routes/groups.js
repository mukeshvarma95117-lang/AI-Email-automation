import express from 'express';
import { getGroups, createGroup, deleteGroup } from '../controllers/groupsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getGroups);
router.post('/', createGroup);
router.delete('/:id', deleteGroup);

export default router;

