/**
 * Product Types
 * Types for inventory management
 */

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  store_id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock?: number;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price?: number;
  cost?: number;
  stock?: number;
  min_stock?: number;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductFilters {
  store_id: string;
  search?: string | undefined;
  category?: string | undefined;
  is_active?: boolean | undefined;
  low_stock?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sort_by?: 'name' | 'price' | 'stock' | 'created_at' | undefined;
  sort_order?: 'asc' | 'desc' | undefined;
}

export interface ProductStats {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  categories_count: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: ProductStats;
}
