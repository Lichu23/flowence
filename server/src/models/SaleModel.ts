import { BaseModel } from './BaseModel';
import { supabaseService } from '../services/SupabaseService';
import { Sale } from '../types';

export class SaleModel extends BaseModel {
  async findById(id: string): Promise<Sale | null> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              name,
              barcode
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  async findByStore(storeId: string, filters?: {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<Sale[]> {
    try {
      return await supabaseService.getSales(storeId, filters);
    } catch (error) {
      return [];
    }
  }

  async create(saleData: {
    storeId: string;
    userId: string;
    totalAmount: number;
    paymentMethod: 'cash' | 'card';
    amountReceived: number;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<Sale> {
    try {
      // Create the sale
      const sale = await supabaseService.createSale({
        storeId: saleData.storeId,
        userId: saleData.userId,
        totalAmount: saleData.totalAmount,
        paymentMethod: saleData.paymentMethod,
        amountReceived: saleData.amountReceived
      }, saleData.items);

      return sale;
    } catch (error) {
      this.handleError(error, 'Create sale');
    }
  }

  async update(id: string, updates: Partial<Sale>): Promise<Sale> {
    const { data, error } = await this.supabase
      .from('sales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Update sale');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      this.handleError(error, 'Delete sale');
    }
  }

  async getSalesByDateRange(storeId: string, startDate: string, endDate: string): Promise<Sale[]> {
    try {
      return await this.findByStore(storeId, { startDate, endDate });
    } catch (error) {
      return [];
    }
  }

  async getSalesByUser(userId: string, storeId: string): Promise<Sale[]> {
    try {
      return await this.findByStore(storeId, { userId });
    } catch (error) {
      return [];
    }
  }

  async getTotalSales(storeId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      let query = this.supabase
        .from('sales')
        .select('total_amount')
        .eq('store_id', storeId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'Get total sales');
      }

      return data?.reduce((total, sale) => total + parseFloat(sale.total_amount), 0) || 0;
    } catch (error) {
      return 0;
    }
  }
}
