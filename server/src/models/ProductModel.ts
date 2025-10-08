import { BaseModel } from './BaseModel';
import { supabaseService } from '../services/SupabaseService';
import { Product } from '../types';

export class ProductModel extends BaseModel {
  async findById(id: string, storeId: string): Promise<Product | null> {
    try {
      return await supabaseService.getProductById(id, storeId);
    } catch (error) {
      return null;
    }
  }

  async findByStore(storeId: string, filters?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    try {
      return await supabaseService.getProducts(storeId, filters);
    } catch (error) {
      return [];
    }
  }

  async create(productData: {
    name: string;
    barcode?: string;
    price: number;
    cost: number;
    stock: number;
    category?: string;
    description?: string;
    storeId: string;
  }): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .insert({
        name: productData.name,
        barcode: productData.barcode,
        price: productData.price,
        cost: productData.cost,
        stock: productData.stock,
        category: productData.category,
        description: productData.description,
        store_id: productData.storeId,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Create product');
    }

    return data;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Update product');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      this.handleError(error, 'Delete product');
    }
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Update stock');
    }

    return data;
  }

  async findLowStock(storeId: string, threshold?: number): Promise<Product[]> {
    try {
      const thresholdValue = threshold || 5;
      
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .lt('stock', thresholdValue);

      if (error) {
        this.handleError(error, 'Find low stock products');
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }
}
