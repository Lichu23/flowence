export interface Sale {
  id: string;
  storeId: string;
  userId: string;
  totalAmount: number;
  taxAmount: number;
  paymentMethod: 'cash' | 'card';
  amountReceived?: number;
  change?: number;
  status: 'completed' | 'cancelled' | 'refunded';
  receiptNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageSaleAmount: number;
  salesByPaymentMethod: {
    cash: number;
    card: number;
  };
  salesByDate: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export interface SalesReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: SalesSummary;
  sales: SaleWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RefundRequest {
  saleId: string;
  items: Array<{
    saleItemId: string;
    quantity: number;
    reason: string;
  }>;
  reason: string;
  refundMethod: 'cash' | 'card';
}

export interface Refund {
  id: string;
  saleId: string;
  amount: number;
  reason: string;
  refundMethod: 'cash' | 'card';
  processedBy: string;
  processedAt: Date;
  createdAt: Date;
}

export interface ShoppingCart {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  barcode?: string;
  category?: string;
}


