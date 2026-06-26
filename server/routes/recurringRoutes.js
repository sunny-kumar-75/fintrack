import express from 'express';
import protect from '../middleware/auth.js';
import { 
  getRecurring, 
  createRecurring, 
  updateRecurring, 
  deleteRecurring 
} from '../controllers/recurringController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRecurring)
  .post(createRecurring);

router.route('/:id')
  .put(updateRecurring)
  .delete(deleteRecurring);

export default router;
