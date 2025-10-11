/**
 * Auth Service (Multi-Store Architecture)
 * Handles authentication with multi-store support
 */

import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserModel } from '../models/UserModel';
import { StoreModel } from '../models/StoreModel';
import { UserStoreModel } from '../models/UserStoreModel';
import { 
  RegisterData, 
  LoginCredentials, 
  AuthResponse 
} from '../types/user';

const userModel = new UserModel();
const storeModel = new StoreModel();
const userStoreModel = new UserStoreModel();

export class AuthService {
  /**
   * Register new owner with first store
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('🔐 Starting user registration (multi-store)...');
      console.log('📧 Email:', registerData.email);
      console.log('👤 Name:', registerData.name);
      console.log('🏪 First Store:', registerData.store_name);
      if (registerData.store_address) {
        console.log('📍 Store Address:', registerData.store_address);
      }
      if (registerData.store_phone) {
        console.log('📞 Store Phone:', registerData.store_phone);
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(registerData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await userModel.findByEmail(registerData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // 1. Create user
      console.log('👤 Creating user...');
      const user = await userModel.create({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        role: 'owner'
      });
      console.log('✅ User created:', user.id);

      // 2. Create first store with address and phone if provided
      console.log('🏪 Creating first store...');
      const storeData: any = {
        owner_id: user.id,
        name: registerData.store_name,
        currency: 'USD',
        tax_rate: 0,
        low_stock_threshold: 5
      };

      // Only include address and phone if they were provided
      if (registerData.store_address) {
        storeData.address = registerData.store_address;
      }
      if (registerData.store_phone) {
        storeData.phone = registerData.store_phone;
      }

      const store = await storeModel.create(storeData);
      console.log('✅ Store created:', store.id);

      // 3. Create user-store relationship
      console.log('🔗 Creating user-store relationship...');
      await userStoreModel.create({
        user_id: user.id,
        store_id: store.id,
        role: 'owner'
      });
      console.log('✅ Relationship created');

      // 4. Get user with stores for response
      const userWithStores = await userModel.findByIdWithStores(user.id);
      if (!userWithStores) {
        throw new Error('Failed to retrieve user with stores');
      }

      // 5. Generate tokens
      const token = this.generateToken(user);

      console.log('✅ Registration completed successfully!');
      
      // Return user profile (without password_hash)
      const { password_hash, ...userProfile } = userWithStores;
      
      return {
        user: userProfile,
        token
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   * Returns user with accessible stores
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt for:', credentials.email);

      // Validate password
      const user = await userModel.validatePassword(credentials.email, credentials.password);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Get user with stores
      const userWithStores = await userModel.findByIdWithStores(user.id);
      if (!userWithStores) {
        throw new Error('Failed to retrieve user data');
      }

      // Generate token
      const token = this.generateToken(user);

      console.log('✅ Login successful');
      console.log(`📊 User has access to ${userWithStores.stores.length} store(s)`);

      // Return user profile (without password_hash)
      const { password_hash, ...userProfile } = userWithStores;

      return {
        user: userProfile,
        token
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Get current user with stores
   */
  async getCurrentUser(userId: string): Promise<AuthResponse['user']> {
    const userWithStores = await userModel.findByIdWithStores(userId);
    if (!userWithStores) {
      throw new Error('User not found');
    }

    // Return user profile (without password_hash)
    const { password_hash, ...userProfile } = userWithStores;
    return userProfile;
  }

  /**
   * Refresh token
   * Accepts tokens that are expired within a 5-minute grace period
   */
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      let payload: any;
      
      // Try to verify token normally first
      try {
        payload = jwt.verify(token, config.jwt.secret as string, {
          issuer: 'flowence',
          audience: 'flowence-users'
        }) as any;
      } catch (error) {
        // If token is expired, try to verify with grace period
        if (error instanceof jwt.TokenExpiredError) {
          console.log('⏰ Token expired, checking grace period...');
          
          // Decode without verification to check expiry time
          const decoded = jwt.decode(token) as any;
          if (!decoded || !decoded.exp) {
            throw new Error('Invalid token format');
          }
          
          const expiryTime = decoded.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
          
          // Allow refresh if token expired within last 5 minutes
          if (now - expiryTime > gracePeriod) {
            throw new Error('Token expired beyond grace period');
          }
          
          console.log('✅ Token within grace period, allowing refresh');
          payload = decoded;
        } else {
          throw error;
        }
      }
      
      // Get user with stores
      const userWithStores = await userModel.findByIdWithStores(payload.userId);
      if (!userWithStores) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = this.generateToken({
        id: userWithStores.id,
        email: userWithStores.email,
        role: userWithStores.role
      });

      console.log('🔄 Token refreshed successfully for user:', userWithStores.email);

      // Return user profile (without password_hash)
      const { password_hash, ...userProfile } = userWithStores;

      return {
        user: userProfile,
        token: newToken
      };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Logout user
   */
  async logout(_userId: string): Promise<void> {
    // With JWT, logout is handled client-side by removing the token
    // Server-side blacklist could be implemented here if needed
    console.log('🚪 User logged out');
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: { id: string; email: string; role: string }): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret as string, {
      expiresIn: '30m',
      issuer: 'flowence',
      audience: 'flowence-users'
    });
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const authService = new AuthService();
