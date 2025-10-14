/**
 * Cart Type Definitions
 * Shopping cart for POS system
 */

import { Product } from './product';

/**
 * Item in the shopping cart
 */
export interface CartItem {
  product_id: string;
  name: string;
  barcode: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  stock_available: number;
  stock_venta_available: number; // Sales floor stock
}

/**
 * Shopping cart
 */
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  tax_rate: number; // Store-specific tax rate (e.g., 0.16 for 16%)
  total: number;
  item_count: number;
}

/**
 * Request to validate cart
 */
export interface ValidateCartRequest {
  items: {
    product_id: string;
    quantity: number;
  }[];
}

/**
 * Response from cart validation
 */
export interface ValidateCartResponse {
  cart: Cart;
  valid: boolean;
  errors: CartValidationError[];
}

/**
 * Cart validation error
 */
export interface CartValidationError {
  product_id: string;
  product_name: string;
  error_type: 'insufficient_stock' | 'product_not_found' | 'product_inactive';
  message: string;
  requested_quantity?: number;
  available_quantity?: number;
}

/**
 * Convert Product to CartItem
 */
export const productToCartItem = (product: Product, quantity: number): CartItem => {
  const subtotal = product.price * quantity;
  
  return {
    product_id: product.id,
    name: product.name,
    barcode: product.barcode || null,
    price: product.price,
    quantity,
    subtotal,
    stock_available: product.stock || 0,
    stock_venta_available: product.stock_venta || 0
  };
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (items: CartItem[], taxRate: number = 0): Cart => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const item_count = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    tax_rate: taxRate,
    total: Number(total.toFixed(2)),
    item_count
  };
};


