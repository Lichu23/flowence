import { Pool } from 'pg';
import { Store, CreateStoreRequest, UpdateStoreRequest } from '../types';
import { config } from '../config';
import { NotFoundError, ConflictError } from '../types';

export class StoreModel {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.server.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async create(storeData: CreateStoreRequest, ownerId: string): Promise<Store> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if store name already exists for this owner
      const existingStore = await client.query(
        'SELECT id FROM stores WHERE name = $1 AND owner_id = $2',
        [storeData.name, ownerId]
      );

      if (existingStore.rows.length > 0) {
        throw new ConflictError('Store with this name already exists for this owner');
      }

      // Create store
      const result = await client.query(
        `INSERT INTO stores (name, address, phone, currency, tax_rate, low_stock_threshold, owner_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          storeData.name,
          storeData.address || null,
          storeData.phone || null,
          storeData.currency || 'USD',
          storeData.taxRate || 0,
          storeData.lowStockThreshold || 5,
          ownerId
        ]
      );

      await client.query('COMMIT');

      const store = result.rows[0];
      return {
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
        currency: store.currency,
        taxRate: store.tax_rate,
        lowStockThreshold: store.low_stock_threshold,
        ownerId: store.owner_id,
        isActive: store.is_active,
        createdAt: store.created_at,
        updatedAt: store.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Store | null> {
    const result = await this.pool.query(
      'SELECT * FROM stores WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const store = result.rows[0];
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      currency: store.currency,
      taxRate: store.tax_rate,
      lowStockThreshold: store.low_stock_threshold,
      ownerId: store.owner_id,
      isActive: store.is_active,
      createdAt: store.created_at,
      updatedAt: store.updated_at
    };
  }

  async findByOwnerId(ownerId: string): Promise<Store[]> {
    const result = await this.pool.query(
      'SELECT * FROM stores WHERE owner_id = $1 AND is_active = true ORDER BY created_at ASC',
      [ownerId]
    );

    return result.rows.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      currency: store.currency,
      taxRate: store.tax_rate,
      lowStockThreshold: store.low_stock_threshold,
      ownerId: store.owner_id,
      isActive: store.is_active,
      createdAt: store.created_at,
      updatedAt: store.updated_at
    }));
  }

  async update(id: string, updateData: UpdateStoreRequest): Promise<Store> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if store exists
      const existingStore = await client.query(
        'SELECT * FROM stores WHERE id = $1 AND is_active = true',
        [id]
      );

      if (existingStore.rows.length === 0) {
        throw new NotFoundError('Store not found');
      }

      // Check name uniqueness if name is being updated
      if (updateData.name && updateData.name !== existingStore.rows[0].name) {
        const nameCheck = await client.query(
          'SELECT id FROM stores WHERE name = $1 AND owner_id = $2 AND id != $3',
          [updateData.name, existingStore.rows[0].owner_id, id]
        );

        if (nameCheck.rows.length > 0) {
          throw new ConflictError('Store with this name already exists for this owner');
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      if (updateData.name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(updateData.name);
      }

      if (updateData.address !== undefined) {
        updateFields.push(`address = $${paramCount++}`);
        updateValues.push(updateData.address);
      }

      if (updateData.phone !== undefined) {
        updateFields.push(`phone = $${paramCount++}`);
        updateValues.push(updateData.phone);
      }

      if (updateData.currency !== undefined) {
        updateFields.push(`currency = $${paramCount++}`);
        updateValues.push(updateData.currency);
      }

      if (updateData.taxRate !== undefined) {
        updateFields.push(`tax_rate = $${paramCount++}`);
        updateValues.push(updateData.taxRate);
      }

      if (updateData.lowStockThreshold !== undefined) {
        updateFields.push(`low_stock_threshold = $${paramCount++}`);
        updateValues.push(updateData.lowStockThreshold);
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id);

      const query = `
        UPDATE stores 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, updateValues);

      await client.query('COMMIT');

      const store = result.rows[0];
      return {
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
        currency: store.currency,
        taxRate: store.tax_rate,
        lowStockThreshold: store.low_stock_threshold,
        ownerId: store.owner_id,
        isActive: store.is_active,
        createdAt: store.created_at,
        updatedAt: store.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.pool.query(
      'UPDATE stores SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Store not found');
    }
  }

  async getStoreStats(storeId: string): Promise<{
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
    lowStockProducts: number;
  }> {
    const client = await this.pool.connect();
    
    try {
      // Get total products
      const productsResult = await client.query(
        'SELECT COUNT(*) as count FROM products WHERE store_id = $1 AND is_active = true',
        [storeId]
      );

      // Get total sales and revenue
      const salesResult = await client.query(
        'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE store_id = $1',
        [storeId]
      );

      // Get low stock products
      const lowStockResult = await client.query(
        'SELECT COUNT(*) as count FROM products WHERE store_id = $1 AND stock <= low_stock_threshold AND is_active = true',
        [storeId]
      );

      return {
        totalProducts: parseInt(productsResult.rows[0].count),
        totalSales: parseInt(salesResult.rows[0].count),
        totalRevenue: parseFloat(salesResult.rows[0].revenue),
        lowStockProducts: parseInt(lowStockResult.rows[0].count)
      };
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

