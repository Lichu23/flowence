-- Migration: 004_create_products
-- Description: Create products table with store association
-- Date: 2025-10-09

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(255),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category VARCHAR(100),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Barcode must be unique within a store, but can repeat across stores
  UNIQUE(store_id, barcode)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_store_category ON products(store_id, category);

-- Add trigger to update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE products IS 'Products table with store-specific inventory';
COMMENT ON COLUMN products.id IS 'Unique product identifier';
COMMENT ON COLUMN products.store_id IS 'Reference to the store this product belongs to';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.barcode IS 'Product barcode (unique per store)';
COMMENT ON COLUMN products.price IS 'Product selling price';
COMMENT ON COLUMN products.cost IS 'Product cost price';
COMMENT ON COLUMN products.stock IS 'Current stock quantity';
COMMENT ON COLUMN products.category IS 'Product category';
COMMENT ON COLUMN products.description IS 'Product description';
COMMENT ON COLUMN products.image_url IS 'URL to product image';
COMMENT ON COLUMN products.created_at IS 'Timestamp when product was created';
COMMENT ON COLUMN products.updated_at IS 'Timestamp when product was last updated';

