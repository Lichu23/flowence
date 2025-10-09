/**
 * Sale Types (Multi-Store Architecture)
 */

export interface Sale {
  id: string;
  store_id: string; // Multi-store: each sale belongs to one store
  user_id: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card' | 'other';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CreateSaleData {
  store_id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  payment_method: 'cash' | 'card' | 'other';
  notes?: string;
}

export interface SaleWithItems extends Sale {
  items: Array<SaleItem & {
    product_name: string;
    product_barcode?: string;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  average_sale_amount: number;
  sales_by_payment_method: {
    cash: number;
    card: number;
    other: number;
  };
  sales_by_date: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

export interface SalesReport {
  store_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: SalesSummary;
  sales: SaleWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface RefundRequest {
  sale_id: string;
  items: Array<{
    sale_item_id: string;
    quantity: number;
    reason: string;
  }>;
  reason: string;
  refund_method: 'cash' | 'card';
}

export interface Refund {
  id: string;
  sale_id: string;
  amount: number;
  reason: string;
  refund_method: 'cash' | 'card';
  processed_by: string;
  processed_at: string;
  created_at: string;
}

// Frontend types
export interface ShoppingCart {
  store_id: string; // Cart is specific to a store
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  item_count: number;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  barcode?: string;
  category?: string;
  available_stock: number;
}
