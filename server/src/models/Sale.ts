import { Pool } from 'pg';
import { Sale, CreateSaleRequest, SaleSearchParams, SaleItem } from '../types';
import { config } from '../config';
import { NotFoundError } from '../types';

export class SaleModel {
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

  async create(saleData: CreateSaleRequest, storeId: string, userId: string): Promise<Sale> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate all products exist and have sufficient stock
      for (const item of saleData.items) {
        const product = await client.query(
          'SELECT * FROM products WHERE id = $1 AND store_id = $2 AND is_active = true',
          [item.productId, storeId]
        );

        if (product.rows.length === 0) {
          throw new NotFoundError(`Product with id ${item.productId} not found`);
        }

        if (product.rows[0].stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.rows[0].name}. Available: ${product.rows[0].stock}, Requested: ${item.quantity}`);
        }
      }

      // Calculate total amount
      let totalAmount = 0;
      for (const item of saleData.items) {
        totalAmount += item.unitPrice * item.quantity;
      }

      // Create sale
      const saleResult = await client.query(
        `INSERT INTO sales (store_id, user_id, total_amount, payment_method, amount_received, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [
          storeId,
          userId,
          totalAmount,
          saleData.paymentMethod,
          saleData.amountReceived || totalAmount
        ]
      );

      const sale = saleResult.rows[0];

      // Create sale items and update stock
      for (const item of saleData.items) {
        // Create sale item
        await client.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            sale.id,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.unitPrice * item.quantity
          ]
        );

        // Update product stock
        await client.query(
          'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      await client.query('COMMIT');

      return {
        id: sale.id,
        storeId: sale.store_id,
        userId: sale.user_id,
        totalAmount: sale.total_amount,
        paymentMethod: sale.payment_method,
        amountReceived: sale.amount_received,
        items: saleData.items,
        createdAt: sale.created_at,
        updatedAt: sale.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string, storeId: string): Promise<Sale | null> {
    const result = await this.pool.query(
      `SELECT s.*, 
              json_agg(
                json_build_object(
                  'productId', si.product_id,
                  'quantity', si.quantity,
                  'unitPrice', si.unit_price,
                  'totalPrice', si.total_price
                )
              ) as items
       FROM sales s
       LEFT JOIN sale_items si ON s.id = si.sale_id
       WHERE s.id = $1 AND s.store_id = $2
       GROUP BY s.id`,
      [id, storeId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const sale = result.rows[0];
    return {
      id: sale.id,
      storeId: sale.store_id,
      userId: sale.user_id,
      totalAmount: sale.total_amount,
      paymentMethod: sale.payment_method,
      amountReceived: sale.amount_received,
      items: sale.items || [],
      createdAt: sale.created_at,
      updatedAt: sale.updated_at
    };
  }

  async findByStoreId(storeId: string, searchParams: SaleSearchParams = {}): Promise<{
    sales: Sale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      startDate,
      endDate,
      paymentMethod,
      userId,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = searchParams;

    const offset = (page - 1) * limit;
    const whereConditions: string[] = ['s.store_id = $1'];
    const queryParams: any[] = [storeId];
    let paramCount = 2;

    // Add search conditions
    if (startDate) {
      whereConditions.push(`s.created_at >= $${paramCount}`);
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereConditions.push(`s.created_at <= $${paramCount}`);
      queryParams.push(endDate);
      paramCount++;
    }

    if (paymentMethod) {
      whereConditions.push(`s.payment_method = $${paramCount}`);
      queryParams.push(paymentMethod);
      paramCount++;
    }

    if (userId) {
      whereConditions.push(`s.user_id = $${paramCount}`);
      queryParams.push(userId);
      paramCount++;
    }

    // Validate sortBy
    const validSortFields = ['created_at', 'total_amount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM sales s WHERE ${whereClause}`;
    const countResult = await this.pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get sales with items
    const salesQuery = `
      SELECT s.*, 
             json_agg(
               json_build_object(
                 'productId', si.product_id,
                 'quantity', si.quantity,
                 'unitPrice', si.unit_price,
                 'totalPrice', si.total_price
               )
             ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE ${whereClause}
      GROUP BY s.id
      ORDER BY s.${sortField} ${sortDirection}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    queryParams.push(limit, offset);
    const result = await this.pool.query(salesQuery, queryParams);

    const sales = result.rows.map(sale => ({
      id: sale.id,
      storeId: sale.store_id,
      userId: sale.user_id,
      totalAmount: sale.total_amount,
      paymentMethod: sale.payment_method,
      amountReceived: sale.amount_received,
      items: sale.items || [],
      createdAt: sale.created_at,
      updatedAt: sale.updated_at
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      sales,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getSalesStats(storeId: string, startDate?: string, endDate?: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageSaleAmount: number;
    salesByPaymentMethod: { cash: number; card: number };
  }> {
    const whereConditions: string[] = ['store_id = $1'];
    const queryParams: any[] = [storeId];
    let paramCount = 2;

    if (startDate) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(endDate);
      paramCount++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total sales and revenue
    const statsQuery = `
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_sale_amount
      FROM sales 
      WHERE ${whereClause}
    `;

    const statsResult = await this.pool.query(statsQuery, queryParams);
    const stats = statsResult.rows[0];

    // Get sales by payment method
    const paymentMethodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as count
      FROM sales 
      WHERE ${whereClause}
      GROUP BY payment_method
    `;

    const paymentResult = await this.pool.query(paymentMethodQuery, queryParams);
    const salesByPaymentMethod = { cash: 0, card: 0 };

    paymentResult.rows.forEach(row => {
      if (row.payment_method === 'cash') {
        salesByPaymentMethod.cash = parseInt(row.count);
      } else if (row.payment_method === 'card') {
        salesByPaymentMethod.card = parseInt(row.count);
      }
    });

    return {
      totalSales: parseInt(stats.total_sales),
      totalRevenue: parseFloat(stats.total_revenue),
      averageSaleAmount: parseFloat(stats.average_sale_amount),
      salesByPaymentMethod
    };
  }

  async getRecentSales(storeId: string, limit: number = 10): Promise<Sale[]> {
    const result = await this.pool.query(
      `SELECT s.*, 
              json_agg(
                json_build_object(
                  'productId', si.product_id,
                  'quantity', si.quantity,
                  'unitPrice', si.unit_price,
                  'totalPrice', si.total_price
                )
              ) as items
       FROM sales s
       LEFT JOIN sale_items si ON s.id = si.sale_id
       WHERE s.store_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT $2`,
      [storeId, limit]
    );

    return result.rows.map(sale => ({
      id: sale.id,
      storeId: sale.store_id,
      userId: sale.user_id,
      totalAmount: sale.total_amount,
      paymentMethod: sale.payment_method,
      amountReceived: sale.amount_received,
      items: sale.items || [],
      createdAt: sale.created_at,
      updatedAt: sale.updated_at
    }));
  }

  async delete(id: string, storeId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get sale items to restore stock
      const saleItems = await client.query(
        'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
        [id]
      );

      // Restore stock for each product
      for (const item of saleItems.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Delete sale items
      await client.query('DELETE FROM sale_items WHERE sale_id = $1', [id]);

      // Delete sale
      const result = await client.query(
        'DELETE FROM sales WHERE id = $1 AND store_id = $2',
        [id, storeId]
      );

      if (result.rowCount === 0) {
        throw new NotFoundError('Sale not found');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

