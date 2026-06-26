import express from 'express';
import protect from '../middleware/auth.js';
import { 
  getDashboardStats, 
  getDashboardTrends, 
  getCategoryBreakdown, 
  getRecentTransactions,
  getHeatmapData
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/trends', getDashboardTrends);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/recent', getRecentTransactions);
router.get('/heatmap', getHeatmapData);

export default router;
