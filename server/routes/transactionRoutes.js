import express from 'express';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { 
  getTransactions, 
  createTransaction, 
  getTransaction, 
  updateTransaction, 
  deleteTransaction, 
  bulkDelete, 
  uploadReceipt 
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect); 

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.post('/bulk', bulkDelete); 
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
