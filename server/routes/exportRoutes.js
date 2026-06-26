import express from 'express';
import protect from '../middleware/auth.js';
import { exportCSV } from '../controllers/exportController.js';

const router = express.Router();

router.use(protect);

router.get('/csv', exportCSV);

export default router;
