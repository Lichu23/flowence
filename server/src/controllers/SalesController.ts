/**
 * SalesController - Handles POS sales and cart operations
 */

import { Request, Response } from 'express';
import { SaleModel } from '../models/SaleModel';
import { ProductModel } from '../models/ProductModel';
import { StoreModel } from '../models/StoreModel';
import { pool } from '../config';
import { 
  CreateSaleRequest, 
  Sale, 
  SaleItem,
  SaleFilters 
} from '../types/sale';
import {
  ValidateCartRequest,
  Cart,
  CartItem,
  productToCartItem,
  calculateCartTotals,
  CartValidationError
} from '../types/cart';
import { AuthRequest } from '../types/auth';

const saleModel = new SaleModel(pool);
const productModel = new ProductModel(pool);
const storeModel = new StoreModel(pool);

/**
 * Validate shopping cart
 * POST /api/stores/:storeId/sales/cart/validate
 */
export const validateCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { items } = req.body as ValidateCartRequest;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CART',
          message: 'Cart must contain at least one item'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get store to get tax rate
    const store = await storeModel.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        error: {
          code: 'STORE_NOT_FOUND',
          message: 'Store not found'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const taxRate = store.tax_rate || 0;

    // Validate each item
    const cartItems: CartItem[] = [];
    const errors: CartValidationError[] = [];

    for (const item of items) {
      const product = await productModel.findById(item.product_id, storeId);

      if (!product) {
        errors.push({
          product_id: item.product_id,
          product_name: 'Unknown',
          error_type: 'product_not_found',
          message: 'Product not found'
        });
        continue;
      }

      if (!product.is_active) {
        errors.push({
          product_id: item.product_id,
          product_name: product.name,
          error_type: 'product_inactive',
          message: 'Product is not active'
        });
        continue;
      }

      // Check stock availability (from sales floor stock)
      const availableStock = product.stock_venta || 0;
      if (item.quantity > availableStock) {
        errors.push({
          product_id: item.product_id,
          product_name: product.name,
          error_type: 'insufficient_stock',
          message: `Insufficient stock. Available: ${availableStock}, Requested: ${item.quantity}`,
          requested_quantity: item.quantity,
          available_quantity: availableStock
        });
        continue;
      }

      // Add to cart
      const cartItem = productToCartItem(product, item.quantity);
      cartItems.push(cartItem);
    }

    // Calculate totals
    const cart = calculateCartTotals(cartItems, taxRate);

    res.json({
      success: true,
      data: {
        cart,
        valid: errors.length === 0,
        errors
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CART_VALIDATION_ERROR',
        message: error.message || 'Failed to validate cart'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create a new sale
 * POST /api/stores/:storeId/sales
 */
export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const userId = req.user!.userId;
    const { items, payment_method, payment_received, notes } = req.body as CreateSaleRequest;

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SALE_DATA',
          message: 'Sale must contain at least one item'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!['cash', 'card'].includes(payment_method)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYMENT_METHOD',
          message: 'Payment method must be cash or card'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get store for tax rate
    const store = await storeModel.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        error: {
          code: 'STORE_NOT_FOUND',
          message: 'Store not found'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const taxRate = store.tax_rate || 0;

    // Build sale items with product details
    const saleItems: SaleItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await productModel.findById(item.product_id, storeId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product ${item.product_id} not found`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_INACTIVE',
            message: `Product ${product.name} is not active`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate stock
      const availableStock = product.stock_venta || 0;
      if (item.quantity > availableStock) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        product_id: product.id,
        product_name: product.name,
        product_barcode: product.barcode || null,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: itemSubtotal
      });
    }

    // Calculate totals
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Calculate change for cash payments
    let change = 0;
    if (payment_method === 'cash' && payment_received) {
      change = payment_received - total;
      if (change < 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PAYMENT',
            message: `Insufficient payment. Total: $${total.toFixed(2)}, Received: $${payment_received.toFixed(2)}`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Create sale
    const saleData: Sale = {
      store_id: storeId,
      user_id: userId,
      sale_date: new Date(),
      items: saleItems,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      tax_rate: taxRate,
      total: Number(total.toFixed(2)),
      payment_method,
      payment_status: 'completed',
      payment_received: payment_received || null,
      change_returned: change > 0 ? Number(change.toFixed(2)) : null,
      notes: notes || null
    };

    const createdSale = await saleModel.create(saleData);

    res.status(201).json({
      success: true,
      data: {
        sale_id: createdSale.id,
        total: createdSale.total,
        change: createdSale.change_returned,
        payment_status: createdSale.payment_status,
        sale: createdSale
      },
      message: 'Sale created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALE_CREATION_ERROR',
        message: error.message || 'Failed to create sale'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get all sales for a store
 * GET /api/stores/:storeId/sales
 */
export const getSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { 
      user_id, 
      start_date, 
      end_date, 
      payment_method, 
      payment_status, 
      page = '1', 
      limit = '20' 
    } = req.query;

    const filters: SaleFilters = {
      store_id: storeId,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    if (user_id) filters.user_id = user_id as string;
    if (start_date) filters.start_date = new Date(start_date as string);
    if (end_date) filters.end_date = new Date(end_date as string);
    if (payment_method) filters.payment_method = payment_method as 'cash' | 'card';
    if (payment_status) filters.payment_status = payment_status as any;

    const result = await saleModel.findAll(filters);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALES_FETCH_ERROR',
        message: error.message || 'Failed to fetch sales'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get sale by ID
 * GET /api/stores/:storeId/sales/:saleId
 */
export const getSaleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId, saleId } = req.params;

    const sale = await saleModel.findById(saleId, storeId);

    if (!sale) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SALE_NOT_FOUND',
          message: 'Sale not found'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      success: true,
      data: sale,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALE_FETCH_ERROR',
        message: error.message || 'Failed to fetch sale'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get daily sales summary
 * GET /api/stores/:storeId/sales/summary/daily
 */
export const getDailySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { date } = req.query;

    const summaryDate = date ? new Date(date as string) : new Date();

    const summary = await saleModel.getDailySummary(storeId, summaryDate);

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get daily summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUMMARY_FETCH_ERROR',
        message: error.message || 'Failed to fetch daily summary'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Cancel/refund a sale
 * DELETE /api/stores/:storeId/sales/:saleId
 */
export const cancelSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId, saleId } = req.params;
    const userRole = req.user!.role;

    // Only owners can cancel sales
    if (userRole !== 'owner') {
      res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only owners can cancel sales'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const deleted = await saleModel.delete(saleId, storeId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SALE_NOT_FOUND',
          message: 'Sale not found'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      success: true,
      message: 'Sale cancelled and stock restored',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cancel sale error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALE_CANCELLATION_ERROR',
        message: error.message || 'Failed to cancel sale'
      },
      timestamp: new Date().toISOString()
    });
  }
};


