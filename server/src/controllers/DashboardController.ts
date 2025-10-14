import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  /**
   * Get dashboard statistics
   * GET /api/dashboard/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.params['storeId'];
      const userRole = (req as any).user?.role;

      if (!storeId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_STORE_ID',
            message: 'Store ID is required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const stats = await DashboardService.getDashboardStats(storeId, userRole);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('DashboardController.getStats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch dashboard statistics'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get inventory statistics for all stores owned by the user
   * GET /api/dashboard/stores-inventory
   */
  static async getOwnerStoresInventory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      // Only owners can access this endpoint
      if (userRole !== 'owner') {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Only owners can access stores inventory statistics'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const storesStats = await DashboardService.getOwnerStoresInventoryStats(userId);

      res.json({
        success: true,
        data: storesStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('DashboardController.getOwnerStoresInventory error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch stores inventory statistics'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}
