import { BaseModel } from './BaseModel';
import { supabaseService } from '../services/SupabaseService';
import { Store } from '../types';

export class StoreModel extends BaseModel {
  async findById(id: string): Promise<Store | null> {
    try {
      return await supabaseService.getStoreById(id);
    } catch (error) {
      return null;
    }
  }

  async findByOwner(ownerId: string): Promise<Store[]> {
    try {
      return await supabaseService.getStores(ownerId);
    } catch (error) {
      return [];
    }
  }

  async create(storeData: {
    name: string;
    address?: string;
    phone?: string;
    currency?: string;
    taxRate?: number;
    lowStockThreshold?: number;
  }, ownerId: string): Promise<Store> {
    const { data, error } = await this.supabase
      .from('stores')
      .insert({
        name: storeData.name,
        address: storeData.address,
        phone: storeData.phone,
        currency: storeData.currency || 'USD',
        tax_rate: storeData.taxRate || 0,
        low_stock_threshold: storeData.lowStockThreshold || 5,
        owner_id: ownerId,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Create store');
    }

    return data;
  }

  async update(id: string, updates: Partial<Store>): Promise<Store> {
    const { data, error } = await this.supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Update store');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('stores')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      this.handleError(error, 'Delete store');
    }
  }
}
