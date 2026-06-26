import express from 'express';
import protect from '../middleware/auth.js';
import { 
  getBudget, 
  createOrUpdateBudget, 
  getBudgetStatus 
} from '../controllers/budgetController.js';

const router = express.Router();

router.use(protect);

router.get('/status', getBudgetStatus);
router.route('/')
  .get(getBudget)
  .post(createOrUpdateBudget);

export default router;
