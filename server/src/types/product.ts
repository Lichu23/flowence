/**
 * Product Types (Multi-Store Architecture)
 */

export interface Product {
  id: string;
  store_id: string; // Multi-store: each product belongs to one store
  name: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  category?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  store_id: string;
  name: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
  category?: string;
  description?: string;
  image_url?: string;
}

export interface UpdateProductData {
  name?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  stock?: number;
  category?: string;
  description?: string;
  image_url?: string;
}

export interface ProductWithStore extends Product {
  store: {
    id: string;
    name: string;
  };
}

export interface ProductStats {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  average_price: number;
  top_categories: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

export interface StockMovement {
  id: string;
  product_id: string;
  store_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference_id?: string; // Sale ID or adjustment ID
  user_id: string;
  created_at: string;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
  category?: string;
  last_restocked?: string;
}

export interface ProductSearchParams {
  store_id: string; // Required: always search within a store
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  low_stock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BulkProductOperation {
  operation: 'update' | 'delete';
  product_ids: string[];
  data?: Partial<UpdateProductData>;
}
