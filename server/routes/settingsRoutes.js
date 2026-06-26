import express from 'express';
import protect from '../middleware/auth.js';
import { 
  updateProfile, 
  deleteAccount 
} from '../controllers/settingsController.js';

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.delete('/account', deleteAccount);

export default router;
