import express from 'express';
import protect from '../middleware/auth.js';
import { getInsights, chat, processReceipt, categorize } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);

router.get('/insights', getInsights);
router.post('/chat', chat);
router.post('/scan-receipt', processReceipt);
router.post('/categorize', categorize);

export default router;
