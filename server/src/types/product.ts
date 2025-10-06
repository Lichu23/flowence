export interface Product {
  id: string;
  storeId: string;
  name: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  storeId: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  averagePrice: number;
  topCategories: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  referenceId?: string; // Sale ID or adjustment ID
  userId: string;
  createdAt: Date;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  category?: string;
  lastRestocked?: Date;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkProductOperation {
  operation: 'update' | 'delete' | 'activate' | 'deactivate';
  productIds: string[];
  data?: Partial<Product>;
}


