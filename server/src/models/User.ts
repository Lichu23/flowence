import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import { config } from '../config';
import { NotFoundError, ConflictError, ValidationError } from '../types';

export class UserModel {
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

  async create(userData: CreateUserRequest): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, role, store_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [userData.email, hashedPassword, userData.name, userData.role, userData.storeId]
      );

      await client.query('COMMIT');

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.store_id,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.store_id,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.store_id,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async findByStoreId(storeId: string): Promise<User[]> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE store_id = $1 AND is_active = true ORDER BY created_at ASC',
      [storeId]
    );

    return result.rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.store_id,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }

  async update(id: string, updateData: UpdateUserRequest): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user exists
      const existingUser = await client.query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [id]
      );

      if (existingUser.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingUser.rows[0].email) {
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [updateData.email, id]
        );

        if (emailCheck.rows.length > 0) {
          throw new ConflictError('User with this email already exists');
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

      if (updateData.email !== undefined) {
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(updateData.email);
      }

      if (updateData.role !== undefined) {
        updateFields.push(`role = $${paramCount++}`);
        updateValues.push(updateData.role);
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, updateValues);

      await client.query('COMMIT');

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.store_id,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
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
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('User not found');
    }
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.store_id,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    
    const result = await this.pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('User not found');
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

