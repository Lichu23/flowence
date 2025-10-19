import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { SaleService } from '../services/SaleService';

export class PaymentController {
  private paymentService = new PaymentService();
  private saleService = new SaleService();

  async createIntent(req: Request, res: Response): Promise<void> {
    try {
      const { amount_cents, currency = 'usd', receipt_number, metadata } = req.body as any;
      const storeId = (req.params as any)['storeId'] as string;

      if (!amount_cents || typeof amount_cents !== 'number' || amount_cents <= 0) {
        res.status(400).json({ success: false, error: { code: 'INVALID_AMOUNT', message: 'amount_cents must be a positive number' }, timestamp: new Date().toISOString() });
        return;
      }

      const intent = await this.paymentService.createPaymentIntent({
        amountCents: amount_cents,
        currency,
        storeId,
        receiptNumber: receipt_number,
        metadata,
      });

      res.status(201).json({ success: true, data: { client_secret: (intent as any).client_secret, payment_intent_id: intent.id }, message: 'Payment intent created', timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(400).json({ success: false, error: { code: 'PAYMENT_INTENT_FAILED', message: error instanceof Error ? error.message : 'Failed to create payment intent' }, timestamp: new Date().toISOString() });
    }
  }

  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 PaymentController.confirmPayment called');
      console.log('🔍 Request params:', req.params);
      console.log('🔍 Request body:', req.body);
      
      const { payment_intent_id, sale_data } = req.body as any;
      const storeId = (req.params as any)['storeId'] as string;
      const userId = (req as any).user?.id || (req as any).user?.userId;

      if (!payment_intent_id) {
        res.status(400).json({ success: false, error: { code: 'MISSING_PAYMENT_INTENT', message: 'payment_intent_id is required' }, timestamp: new Date().toISOString() });
        return;
      }

      if (!sale_data) {
        res.status(400).json({ success: false, error: { code: 'MISSING_SALE_DATA', message: 'sale_data is required' }, timestamp: new Date().toISOString() });
        return;
      }

      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, timestamp: new Date().toISOString() });
        return;
      }

      // Verify payment intent status with Stripe
      const paymentIntent = await this.paymentService.retrievePaymentIntent(payment_intent_id);
      
      if (paymentIntent.status !== 'succeeded') {
        res.status(400).json({ 
          success: false, 
          error: { 
            code: 'PAYMENT_NOT_SUCCEEDED', 
            message: `Payment not successful. Status: ${paymentIntent.status}` 
          }, 
          timestamp: new Date().toISOString() 
        });
        return;
      }

      // Only process sale after payment is confirmed successful
      const sale = await this.saleService.processSale({ ...sale_data, store_id: storeId }, userId, true);
      
      // Confirm the pending sale and update stock
      const confirmedSale = await this.saleService.confirmPendingSale(sale.id, storeId);
      
      res.status(201).json({ 
        success: true, 
        data: { sale: confirmedSale, receipt_number: confirmedSale.receipt_number }, 
        message: 'Payment confirmed and sale processed successfully', 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: { 
          code: 'PAYMENT_CONFIRMATION_FAILED', 
          message: error instanceof Error ? error.message : 'Failed to confirm payment and process sale' 
        }, 
        timestamp: new Date().toISOString() 
      });
    }
  }
}


