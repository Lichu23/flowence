/**
 * Store Controller
 * Handles store management operations for multi-store architecture
 */

import { Request, Response, NextFunction } from 'express';
import { StoreModel } from '../models/StoreModel';
import { UserStoreModel } from '../models/UserStoreModel';
import { ApiResponse } from '../types';
import { CreateStoreData, UpdateStoreData } from '../types/store';

const storeModel = new StoreModel();
const userStoreModel = new UserStoreModel();

export class StoreController {
  /**
   * Get all stores accessible by current user
   * @route GET /api/stores
   */
  async getUserStores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      const stores = await storeModel.findByUser(userId);

      const response: ApiResponse = {
        success: true,
        data: stores,
        message: 'Stores retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific store by ID
   * @route GET /api/stores/:id
   */
  async getStoreById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.params['id'];
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      if (!storeId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Store ID is required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Verify user has access to this store
      const hasAccess = await userStoreModel.hasAccess(userId, storeId);
      if (!hasAccess) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this store'
          },
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      const store = await storeModel.findByIdWithOwner(storeId);

      if (!store) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Store not found'
          },
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      // Get store statistics
      const stats = await storeModel.getStats(storeId);

      const response: ApiResponse = {
        success: true,
        data: {
          store,
          stats
        },
        message: 'Store retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new store (owners only)
   * @route POST /api/stores
   */
  async createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }
      const userRole = (req as any).user?.['role'];

      // Only owners can create stores
      if (userRole !== 'owner') {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only owners can create stores'
          },
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      const storeData: CreateStoreData = {
        owner_id: userId,
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        currency: req.body.currency || 'USD',
        tax_rate: req.body.tax_rate || 0,
        low_stock_threshold: req.body.low_stock_threshold || 5
      };

      // Create store
      const newStore = await storeModel.create(storeData);

      // Create user-store relationship
      await userStoreModel.create({
        user_id: userId,
        store_id: newStore.id,
        role: 'owner'
      });

      const response: ApiResponse = {
        success: true,
        data: newStore,
        message: 'Store created successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update store (owners only)
   * @route PUT /api/stores/:id
   */
  async updateStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.params['id'];
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      if (!storeId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Store ID is required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Verify user is owner of this store
      const isOwner = await storeModel.isOwner(userId, storeId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only store owners can update store settings'
          },
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      const updates: UpdateStoreData = {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        currency: req.body.currency,
        tax_rate: req.body.tax_rate,
        low_stock_threshold: req.body.low_stock_threshold
      };

      // Remove undefined values
      Object.keys(updates).forEach(key => 
        updates[key as keyof UpdateStoreData] === undefined && 
        delete updates[key as keyof UpdateStoreData]
      );

      const updatedStore = await storeModel.update(storeId, updates);

      const response: ApiResponse = {
        success: true,
        data: updatedStore,
        message: 'Store updated successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete store (owners only)
   * @route DELETE /api/stores/:id
   */
  async deleteStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.params['id'];
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      if (!storeId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Store ID is required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Verify user is owner of this store
      const isOwner = await storeModel.isOwner(userId, storeId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only store owners can delete stores'
          },
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      // Check if this is the user's only store
      const userStores = await storeModel.findByUser(userId);
      if (userStores.length === 1) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Cannot delete your only store. Create another store first.'
          },
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Delete store (cascade will handle related data)
      await storeModel.delete(storeId);

      const response: ApiResponse = {
        success: true,
        message: 'Store deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get store users (employees and owners)
   * @route GET /api/stores/:id/users
   */
  async getStoreUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.params['id'];
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      if (!storeId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Store ID is required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Verify user has access to this store
      const hasAccess = await userStoreModel.hasAccess(userId, storeId);
      if (!hasAccess) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this store'
          },
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      const users = await userStoreModel.getStoreUsers(storeId);

      const response: ApiResponse = {
        success: true,
        data: users,
        message: 'Store users retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get store statistics
   * @route GET /api/stores/:id/stats
   */
  async getStoreStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.params['id'];
      const userId = (req as any).user?.['id'];
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      if (!storeId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Store ID is required'
          },
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Verify user has access to this store
      const hasAccess = await userStoreModel.hasAccess(userId, storeId);
      if (!hasAccess) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this store'
          },
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      const stats = await storeModel.getStats(storeId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Store statistics retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();

