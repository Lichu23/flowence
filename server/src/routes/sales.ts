import { Router } from 'express';
import { SaleController } from '../controllers/SaleController';
import { authenticate } from '../middleware/auth';
import { requireStoreAccess } from '../middleware/storeAccess';

const router = Router();
const controller = new SaleController();

router.use(authenticate);

router.post('/stores/:storeId/sales', requireStoreAccess(), controller.process.bind(controller));
router.get('/stores/:storeId/sales', requireStoreAccess(), controller.list.bind(controller));
router.get('/stores/:storeId/sales/:saleId', requireStoreAccess(), controller.getOne.bind(controller));
router.get('/stores/:storeId/sales/:saleId/receipt', requireStoreAccess(), controller.downloadReceipt.bind(controller));
router.post('/stores/:storeId/sales/:saleId/refund', requireStoreAccess(), controller.refund.bind(controller));

export default router;


