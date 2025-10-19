import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireStoreAccess } from '../middleware/storeAccess';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();
const controller = new PaymentController();

router.use(authenticate);

router.post('/:storeId/payments/intents', requireStoreAccess(), controller.createIntent.bind(controller));
router.post('/:storeId/payments/confirm', requireStoreAccess(), controller.confirmPayment.bind(controller));

export default router;


