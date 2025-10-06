import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

export class DatabaseConnection {
  private pool: Pool;
  private isConnected: boolean = false;

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

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return await this.pool.connect();
  }

  getPool(): Pool {
    return this.pool;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  async runMigrations(): Promise<void> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');

      // Create migrations table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Get list of migration files
      const migrationsDir = path.join(__dirname, 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      // Get executed migrations
      const executedMigrations = await client.query(
        'SELECT filename FROM migrations ORDER BY id'
      );
      const executedFilenames = executedMigrations.rows.map(row => row.filename);

      // Run pending migrations
      for (const filename of migrationFiles) {
        if (!executedFilenames.includes(filename)) {
          console.log(`🔄 Running migration: ${filename}`);
          
          const migrationSQL = fs.readFileSync(
            path.join(migrationsDir, filename),
            'utf8'
          );
          
          await client.query(migrationSQL);
          
          await client.query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [filename]
          );
          
          console.log(`✅ Migration completed: ${filename}`);
        }
      }

      await client.query('COMMIT');
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async rollbackMigration(filename: string): Promise<void> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');

      // Remove migration record
      await client.query(
        'DELETE FROM migrations WHERE filename = $1',
        [filename]
      );

      await client.query('COMMIT');
      console.log(`✅ Migration rolled back: ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Migration rollback failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getMigrationStatus(): Promise<{ filename: string; executed_at: string }[]> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        'SELECT filename, executed_at FROM migrations ORDER BY executed_at'
      );
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  async seedDatabase(): Promise<void> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');

      // Check if database is already seeded
      const existingUsers = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(existingUsers.rows[0].count) > 0) {
        console.log('📋 Database already seeded, skipping...');
        return;
      }

      console.log('🌱 Seeding database...');

      // Create a test store
      const storeResult = await client.query(`
        INSERT INTO stores (name, address, phone, currency, tax_rate, low_stock_threshold, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        'Test Store',
        '123 Main Street, Test City',
        '+1-555-0123',
        'USD',
        0.08,
        5,
        '00000000-0000-0000-0000-000000000000' // Placeholder owner ID
      ]);

      const storeId = storeResult.rows[0].id;

      // Create test products
      const products = [
        {
          name: 'Test Product 1',
          barcode: '1234567890123',
          price: 10.99,
          cost: 7.50,
          stock: 100,
          category: 'Electronics',
          description: 'A test product for development'
        },
        {
          name: 'Test Product 2',
          barcode: '1234567890124',
          price: 5.99,
          cost: 3.50,
          stock: 50,
          category: 'Books',
          description: 'Another test product'
        }
      ];

      for (const product of products) {
        await client.query(`
          INSERT INTO products (name, barcode, price, cost, stock, category, description, store_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          product.name,
          product.barcode,
          product.price,
          product.cost,
          product.stock,
          product.category,
          product.description,
          storeId
        ]);
      }

      await client.query('COMMIT');
      console.log('✅ Database seeded successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Database seeding failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const dbConnection = new DatabaseConnection();

