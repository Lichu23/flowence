import { ProductModel } from '../models/ProductModel';
import { StoreModel } from '../models/StoreModel';
import { SaleModel } from '../models/SaleModel';
import { CreateSaleRequest, Sale, SaleItem } from '../types/sale';

export class SaleService {
  private saleModel = new SaleModel();
  private productModel = new ProductModel();
  private storeModel = new StoreModel();

  async generateReceipt(storeId: string): Promise<string> {
    const year = new Date().getFullYear();
    const latest = await this.saleModel.latestReceiptNumberPrefix(storeId, year);
    const next = latest ? parseInt(latest.split('-')[2] || '0', 10) + 1 : 1;
    return `REC-${year}-${String(next).padStart(6, '0')}`;
  }

  async processSale(req: CreateSaleRequest, userId: string): Promise<Sale & { items: SaleItem[] }> {
    const { store_id, items, payment_method, discount = 0, notes } = req;
    if (!items || items.length === 0) throw new Error('Sale must contain at least one item');

    // Validate each item and compute totals
    let subtotal = 0;
    const preparedItems: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[] = [];

    for (const it of items) {
      const product = await this.productModel.findById(it.product_id, store_id);
      if (!product) throw new Error('Product not found');
      if (!product.is_active) throw new Error(`Product ${product.name} is inactive`);

      const stockType = it.stock_type || 'venta';
      const available = stockType === 'venta' ? (product.stock_venta || 0) : (product.stock_deposito || 0);
      if (available < it.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const unit_price = it.unit_price ?? product.price;
      const itemSubtotal = unit_price * it.quantity;
      const itemDiscount = it.discount || 0;
      const itemTotal = itemSubtotal - itemDiscount;
      subtotal += itemTotal;

      preparedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku ?? null,
        product_barcode: product.barcode ?? null,
        quantity: it.quantity,
        unit_price,
        subtotal: itemSubtotal,
        discount: itemDiscount,
        total: itemTotal,
        stock_type: stockType
      });
    }

    // Tax rate from store (stored as percentage, e.g., 16.00 for 16%)
    const store = await this.storeModel.findById(store_id);
    const taxRate = store?.tax_rate ? Number(store.tax_rate) / 100 : 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;

    const receipt_number = await this.generateReceipt(store_id);

    const saleData = {
      store_id,
      user_id: userId,
      subtotal,
      tax,
      discount,
      total,
      payment_method,
      payment_status: 'completed' as const,
      receipt_number,
      notes
    };

    const { sale, items: createdItems } = await this.saleModel.createSale(saleData as any, preparedItems);

    // Update stock and record movements
    for (const item of createdItems) {
      const product = await this.productModel.findById(item.product_id, sale.store_id);
      if (!product) continue;
      const stockField = item.stock_type === 'venta' ? 'stock_venta' : 'stock_deposito';
      const before = (product as any)[stockField] || 0;
      const after = before - item.quantity;
      if (after < 0) throw new Error(`Stock negative for ${product.name}`);

      // Persist new stock
      await (this as any).productModel['supabase']
        .from('products')
        .update({ [stockField]: after })
        .eq('id', item.product_id)
        .eq('store_id', sale.store_id);

      // Record movement
      await (this as any).productModel['supabase']
        .from('stock_movements')
        .insert({
          product_id: item.product_id,
          store_id: sale.store_id,
          movement_type: 'sale',
          stock_type: item.stock_type,
          quantity_change: -item.quantity,
          quantity_before: before,
          quantity_after: after,
          reason: `Sale ${sale.receipt_number}`,
          performed_by: sale.user_id,
          notes: null
        });
    }

    return { ...(sale as any), items: createdItems };
  }
}


