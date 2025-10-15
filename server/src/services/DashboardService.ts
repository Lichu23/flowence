import { ProductModel } from '../models/ProductModel';
import { UserModel } from '../models/UserModel';
import { UserStoreModel } from '../models/UserStoreModel';
import { SaleModel } from '../models/SaleModel';
import { Product } from '../types/product';

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  revenue: number;
  employees: number;
  lowStockProducts?: number; // Only for owners
  totalValue?: number; // Only for owners
  recentProducts?: any[]; // Only for owners
}

export interface StoreInventoryStats {
  storeId: string;
  storeName: string;
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  employees: number;
}

export class DashboardService {
  private static productModel = new ProductModel();
  private static userModel = new UserModel();
  private static userStoreModel = new UserStoreModel();
  private static saleModel = new SaleModel();

  /**
   * Get dashboard statistics based on user role
   */
  static async getDashboardStats(
    storeId: string, 
    userRole: string
  ): Promise<DashboardStats> {
    const stats: DashboardStats = {
      totalProducts: 0,
      totalSales: 0,
      revenue: 0,
      employees: 0
    };

    try {
      // Get products count for the store
      const productsResult = await this.productModel.findByStore({
        store_id: storeId,
        page: 1,
        limit: 1, // We only need the count
        is_active: true
      });

      stats.totalProducts = productsResult.pagination.total || 0;

      // Get employees count for the store
      const employees = await this.userModel.findByStore(storeId);
      stats.employees = employees.length;

      // Owner gets additional metrics
      if (userRole === 'owner') {
        // Get all products to calculate total value
        const allProductsResult = await this.productModel.findByStore({
          store_id: storeId,
          page: 1,
          limit: 1000, // Get all products
          is_active: true
        });

        const products = (allProductsResult.products || []) as Product[];
        
        // Calculate total inventory value using dual stock
        stats.totalValue = products.reduce((total: number, product: Product) => {
          const warehouseValue = (product.cost * (product.stock_deposito || 0));
          const salesValue = (product.cost * (product.stock_venta || 0));
          return total + warehouseValue + salesValue;
        }, 0);

        // Count low stock products using dual stock
        stats.lowStockProducts = products.filter((product: Product) => {
          const isLowWarehouse = (product.stock_deposito || 0) <= (product.min_stock_deposito || 0);
          const isLowSales = (product.stock_venta || 0) <= (product.min_stock_venta || 0);
          return isLowWarehouse || isLowSales;
        }).length;

        // Get recent products (last 5)
        stats.recentProducts = products
          .sort((a: Product, b: Product) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((product: Product) => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
            price: product.price,
            created_at: product.created_at
          }));
      }

      // Get sales statistics for the store
      const salesResult = await this.saleModel.list({
        store_id: storeId,
        page: 1,
        limit: 1000, // Get all sales to calculate totals
        payment_status: 'completed' // Only count completed sales
      });

      stats.totalSales = salesResult.total || 0;
      
      // Calculate total revenue from completed sales
      stats.revenue = salesResult.sales.reduce((total: number, sale: any) => {
        return total + parseFloat(sale.total || 0);
      }, 0);

      return stats;
    } catch (error) {
      console.error('DashboardService.getDashboardStats error:', error);
      throw error;
    }
  }

  /**
   * Get inventory statistics for all stores owned by a user
   * Only available for owners
   */
  static async getOwnerStoresInventoryStats(userId: string): Promise<StoreInventoryStats[]> {
    try {
      // Get all stores owned by the user
      const ownedStores = await this.userStoreModel.getOwnedStores(userId);
      
      const storesStats: StoreInventoryStats[] = [];

      // Get stats for each store
      for (const userStore of ownedStores) {
        const store = userStore.store;
        if (!store) continue;

        // Get products for this store
        const productsResult = await this.productModel.findByStore({
          store_id: store.id,
          page: 1,
          limit: 1000, // Get all products
          is_active: true
        });

        const products = productsResult.products || [];

        // Calculate total value using cost and dual stock
        const totalValue = products.reduce((total: number, product: Product) => {
          const warehouseValue = (product.cost * (product.stock_deposito || 0));
          const salesValue = (product.cost * (product.stock_venta || 0));
          return total + warehouseValue + salesValue;
        }, 0);

        // Count low stock products using dual stock
        const lowStockProducts = products.filter((product: Product) => {
          const isLowWarehouse = (product.stock_deposito || 0) <= (product.min_stock_deposito || 0);
          const isLowSales = (product.stock_venta || 0) <= (product.min_stock_venta || 0);
          return isLowWarehouse || isLowSales;
        }).length;

        // Get employees count for this store
        const employees = await this.userModel.findByStore(store.id);

        storesStats.push({
          storeId: store.id,
          storeName: store.name,
          totalProducts: productsResult.pagination.total || 0,
          totalValue,
          lowStockProducts,
          employees: employees.length
        });
      }

      return storesStats;
    } catch (error) {
      console.error('DashboardService.getOwnerStoresInventoryStats error:', error);
      throw error;
    }
  }
}
