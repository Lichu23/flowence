export interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSettings {
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export interface StoreStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  lowStockProducts: number;
  totalUsers: number;
  averageSaleAmount: number;
  lastSaleDate?: Date;
}

export interface StoreAnalytics {
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    sales: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    paymentMethod: string;
    count: number;
    total: number;
  }>;
  lowStockAlerts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  }>;
}



