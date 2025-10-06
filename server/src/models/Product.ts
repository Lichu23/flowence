import { Pool } from 'pg';
import { Product, CreateProductRequest, UpdateProductRequest, ProductSearchParams } from '../types';
import { config } from '../config';
import { NotFoundError, ConflictError } from '../types';

export class ProductModel {
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

  async create(productData: CreateProductRequest, storeId: string): Promise<Product> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if barcode already exists in this store
      if (productData.barcode) {
        const existingProduct = await client.query(
          'SELECT id FROM products WHERE barcode = $1 AND store_id = $2 AND is_active = true',
          [productData.barcode, storeId]
        );

        if (existingProduct.rows.length > 0) {
          throw new ConflictError('Product with this barcode already exists in this store');
        }
      }

      // Validate price > cost
      if (productData.price <= productData.cost) {
        throw new Error('Price must be greater than cost');
      }

      // Create product
      const result = await client.query(
        `INSERT INTO products (name, barcode, price, cost, stock, category, description, store_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [
          productData.name,
          productData.barcode || null,
          productData.price,
          productData.cost,
          productData.stock,
          productData.category || null,
          productData.description || null,
          storeId
        ]
      );

      await client.query('COMMIT');

      const product = result.rows[0];
      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        description: product.description,
        storeId: product.store_id,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string, storeId: string): Promise<Product | null> {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE id = $1 AND store_id = $2 AND is_active = true',
      [id, storeId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const product = result.rows[0];
    return {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      category: product.category,
      description: product.description,
      storeId: product.store_id,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  async findByBarcode(barcode: string, storeId: string): Promise<Product | null> {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE barcode = $1 AND store_id = $2 AND is_active = true',
      [barcode, storeId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const product = result.rows[0];
    return {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      category: product.category,
      description: product.description,
      storeId: product.store_id,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  async findByStoreId(storeId: string, searchParams: ProductSearchParams = {}): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      query,
      category,
      lowStock,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = searchParams;

    const offset = (page - 1) * limit;
    const whereConditions: string[] = ['store_id = $1', 'is_active = true'];
    const queryParams: any[] = [storeId];
    let paramCount = 2;

    // Add search conditions
    if (query) {
      whereConditions.push(`(name ILIKE $${paramCount} OR barcode ILIKE $${paramCount})`);
      queryParams.push(`%${query}%`);
      paramCount++;
    }

    if (category) {
      whereConditions.push(`category = $${paramCount}`);
      queryParams.push(category);
      paramCount++;
    }

    if (lowStock) {
      whereConditions.push(`stock <= (SELECT low_stock_threshold FROM stores WHERE id = $1)`);
    }

    // Validate sortBy
    const validSortFields = ['name', 'price', 'stock', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products WHERE ${whereClause}`;
    const countResult = await this.pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get products
    const productsQuery = `
      SELECT * FROM products 
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    queryParams.push(limit, offset);
    const result = await this.pool.query(productsQuery, queryParams);

    const products = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      category: product.category,
      description: product.description,
      storeId: product.store_id,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages
    };
  }

  async update(id: string, storeId: string, updateData: UpdateProductRequest): Promise<Product> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if product exists
      const existingProduct = await client.query(
        'SELECT * FROM products WHERE id = $1 AND store_id = $2 AND is_active = true',
        [id, storeId]
      );

      if (existingProduct.rows.length === 0) {
        throw new NotFoundError('Product not found');
      }

      // Check barcode uniqueness if barcode is being updated
      if (updateData.barcode && updateData.barcode !== existingProduct.rows[0].barcode) {
        const barcodeCheck = await client.query(
          'SELECT id FROM products WHERE barcode = $1 AND store_id = $2 AND id != $3',
          [updateData.barcode, storeId, id]
        );

        if (barcodeCheck.rows.length > 0) {
          throw new ConflictError('Product with this barcode already exists in this store');
        }
      }

      // Validate price > cost if both are being updated
      if (updateData.price !== undefined && updateData.cost !== undefined) {
        if (updateData.price <= updateData.cost) {
          throw new Error('Price must be greater than cost');
        }
      } else if (updateData.price !== undefined) {
        const currentCost = existingProduct.rows[0].cost;
        if (updateData.price <= currentCost) {
          throw new Error('Price must be greater than cost');
        }
      } else if (updateData.cost !== undefined) {
        const currentPrice = existingProduct.rows[0].price;
        if (currentPrice <= updateData.cost) {
          throw new Error('Price must be greater than cost');
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

      if (updateData.barcode !== undefined) {
        updateFields.push(`barcode = $${paramCount++}`);
        updateValues.push(updateData.barcode);
      }

      if (updateData.price !== undefined) {
        updateFields.push(`price = $${paramCount++}`);
        updateValues.push(updateData.price);
      }

      if (updateData.cost !== undefined) {
        updateFields.push(`cost = $${paramCount++}`);
        updateValues.push(updateData.cost);
      }

      if (updateData.stock !== undefined) {
        updateFields.push(`stock = $${paramCount++}`);
        updateValues.push(updateData.stock);
      }

      if (updateData.category !== undefined) {
        updateFields.push(`category = $${paramCount++}`);
        updateValues.push(updateData.category);
      }

      if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        updateValues.push(updateData.description);
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id, storeId);

      const query = `
        UPDATE products 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND store_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await client.query(query, updateValues);

      await client.query('COMMIT');

      const product = result.rows[0];
      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        description: product.description,
        storeId: product.store_id,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStock(id: string, storeId: string, quantity: number, operation: 'add' | 'subtract'): Promise<Product> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current product
      const currentProduct = await client.query(
        'SELECT * FROM products WHERE id = $1 AND store_id = $2 AND is_active = true',
        [id, storeId]
      );

      if (currentProduct.rows.length === 0) {
        throw new NotFoundError('Product not found');
      }

      const currentStock = currentProduct.rows[0].stock;
      let newStock: number;

      if (operation === 'add') {
        newStock = currentStock + quantity;
      } else {
        newStock = currentStock - quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock');
        }
      }

      const result = await client.query(
        'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2 AND store_id = $3 RETURNING *',
        [newStock, id, storeId]
      );

      await client.query('COMMIT');

      const product = result.rows[0];
      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        description: product.description,
        storeId: product.store_id,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string, storeId: string): Promise<void> {
    const result = await this.pool.query(
      'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Product not found');
    }
  }

  async getLowStockProducts(storeId: string): Promise<Product[]> {
    const result = await this.pool.query(
      `SELECT p.* FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.store_id = $1 AND p.stock <= s.low_stock_threshold AND p.is_active = true
       ORDER BY p.stock ASC`,
      [storeId]
    );

    return result.rows.map(product => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      category: product.category,
      description: product.description,
      storeId: product.store_id,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

