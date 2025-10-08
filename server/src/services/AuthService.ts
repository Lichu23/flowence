import jwt from 'jsonwebtoken';
import { supabaseService } from './SupabaseService';
import { User, LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from '../types';
import { config } from '../config';
import { AuthenticationError, ValidationError, ConflictError } from '../types';

export class AuthService {
  constructor() {
    // No need to initialize models, using SupabaseService directly
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Starting user registration process...');
      console.log('📧 Email:', registerData.email);
      console.log('👤 Name:', registerData.name);
      console.log('🏪 Store Name:', registerData.storeName);

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(registerData.password);
      if (!passwordValidation.isValid) {
        console.log('❌ Password validation failed:', passwordValidation.errors);
        throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
      }
      console.log('✅ Password validation passed');

      // 1) Create user in Supabase Auth first, so we have the owner_id
      console.log('🔑 Creating user in Supabase Auth...');
      const authData = await supabaseService.createUser({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        role: 'owner',
        email_confirm: true // Auto-confirm email for development
      });

      if (!authData || !authData.user) {
        console.log('❌ Failed to create user in Supabase Auth');
        throw new Error('Failed to create user in Supabase Auth');
      }
      console.log('✅ User created in Supabase Auth with ID:', authData.user.id);

      // 2) Create user record in our users table
      console.log('👤 Creating user record in users table...');
      const userData = await supabaseService.getAdminClient()
        .from('users')
        .insert({
          id: authData.user.id,
          email: registerData.email,
          name: registerData.name,
          role: 'owner',
          is_active: true
        })
        .select()
        .single();

      if (userData.error) {
        console.log('❌ Failed to create user record:', userData.error);
        throw new Error(`Failed to create user record: ${userData.error.message}`);
      }
      console.log('✅ User record created successfully');

      // 3) Create store for the owner (note: snake_case column names)
      console.log('🏪 Creating store...');
      const storeInsert = await supabaseService.getAdminClient()
        .from('stores')
        .insert({
          name: registerData.storeName,
          currency: 'USD',
          tax_rate: 0,
          low_stock_threshold: 5,
          owner_id: authData.user.id,
          is_active: true
        })
        .select()
        .single();

      if (storeInsert.error) {
        console.log('❌ Failed to create store:', storeInsert.error);
        throw new Error(`Failed to create store: ${storeInsert.error.message}`);
      }

      const store = storeInsert.data;
      console.log('✅ Store created successfully with ID:', store.id);

      // 4) Update user with store_id
      console.log('🔄 Updating user with store_id...');
      const userUpdate = await supabaseService.getAdminClient()
        .from('users')
        .update({ store_id: store.id })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (userUpdate.error) {
        console.log('❌ Failed to update user store_id:', userUpdate.error);
        throw new Error(`Failed to update user store_id: ${userUpdate.error.message}`);
      }
      console.log('✅ User updated with store_id successfully');

      // Generate tokens
      console.log('🎫 Generating JWT tokens...');
      
      // Map database fields to User interface
      const userForTokens: User = {
        id: userUpdate.data.id,
        email: userUpdate.data.email,
        name: userUpdate.data.name,
        role: userUpdate.data.role,
        storeId: userUpdate.data.store_id, // Map store_id to storeId
        isActive: userUpdate.data.is_active,
        createdAt: new Date(userUpdate.data.created_at),
        updatedAt: new Date(userUpdate.data.updated_at)
      };

      const tokens = this.generateTokens(userForTokens);

      // Map database fields to response format
      const userForResponse = {
        id: userUpdate.data.id,
        email: userUpdate.data.email,
        name: userUpdate.data.name,
        role: userUpdate.data.role,
        storeId: userUpdate.data.store_id, // Map store_id to storeId for frontend
        isActive: userUpdate.data.is_active,
        createdAt: userUpdate.data.created_at,
        updatedAt: userUpdate.data.updated_at
      };

      const result = {
        user: userForResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpiration()
      };

      console.log('✅ Registration completed successfully!');
      console.log('📊 Final result:', {
        userId: result.user.id,
        email: result.user.email,
        storeId: result.user.storeId,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        expiresIn: result.expiresIn
      });

      return result;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      // Handle Supabase Auth errors
      if (error instanceof Error) {
        console.log('🔍 Supabase Auth error details:', error.message);
        
        // Check for duplicate email error from Supabase Auth
        if (error.message.includes('already been registered') ||
            error.message.includes('User already registered') ||
            error.message.includes('already exists') ||
            error.message.includes('duplicate key value violates unique constraint')) {
          throw new ConflictError('A user with this email address has already been registered in Supabase Auth. Please use a different email or delete the user from Supabase Auth dashboard.');
        }

        // Check for database constraint violations
        if (error.message.includes('duplicate key') ||
            error.message.includes('unique constraint')) {
          throw new ConflictError('A user with this email address already exists in the database');
        }
      }
      
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Authenticate with Supabase
      const authData = await supabaseService.signIn(loginData.email, loginData.password);
      
      if (!authData.user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Get user data from our users table
      const userData = await supabaseService.getUserById(authData.user.id);
      
      if (!userData) {
        throw new AuthenticationError('User not found');
      }

      // Generate tokens
      const tokens = this.generateTokens(userData);

      return {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpiration()
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      // Handle specific Supabase Auth errors
      if (error instanceof Error) {
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email_not_confirmed')) {
          throw new AuthenticationError('Please check your email and click the confirmation link before logging in');
        }
        
        if (error.message.includes('Invalid login credentials') ||
            error.message.includes('invalid_credentials')) {
          throw new AuthenticationError('Invalid email or password');
        }
      }
      
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('🔄 AuthService: Refreshing token...');
      
      // Verify refresh token
      const payload = jwt.verify(refreshToken, config.jwt.secret as string) as JwtPayload;
      console.log('✅ AuthService: Refresh token verified for user:', payload.userId);
      
      if (payload.type !== 'refresh') {
        console.log('❌ AuthService: Invalid token type:', payload.type);
        throw new AuthenticationError('Invalid token type');
      }

      // Get user
      console.log('👤 AuthService: Getting user data...');
      const user = await supabaseService.getUserById(payload.userId);
      if (!user) {
        console.log('❌ AuthService: User not found:', payload.userId);
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      console.log('🎫 AuthService: Generating new tokens...');
      const tokens = this.generateTokens(user);

      console.log('✅ AuthService: Token refresh completed successfully');
      return {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpiration()
      };
    } catch (error) {
      console.error('❌ AuthService: Token refresh error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        console.log('❌ AuthService: JWT error - Invalid refresh token');
        throw new AuthenticationError('Invalid refresh token');
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        console.log('❌ AuthService: JWT error - Refresh token expired');
        throw new AuthenticationError('Refresh token expired');
      }
      
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const user = await supabaseService.getUserById(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Validate current password by attempting to sign in
      try {
        await supabaseService.signIn(user.email, currentPassword);
      } catch (error) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
      }

      // Update password using Supabase Admin API
      const { error } = await supabaseService.getAdminClient().auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Password change failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Use Supabase's built-in password reset
      const { error } = await supabaseService.getClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env['CORS_ORIGIN'] || 'http://localhost:3000'}/auth/reset-password`
      });

      if (error) {
        throw new Error(`Password reset request failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Password reset request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resetPassword(_token: string, newPassword: string): Promise<void> {
    try {
      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
      }

      // Use Supabase's built-in password reset
      const { error } = await supabaseService.getClient().auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(`Password reset failed: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      console.log(`🚪 AuthService: Logging out user ${userId}...`);
      await supabaseService.signOut();
      console.log(`✅ AuthService: User ${userId} logged out successfully`);
    } catch (error) {
      console.error(`❌ AuthService: Logout failed for user ${userId}:`, error);
      // Don't throw error - logout should always succeed from client perspective
    }
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    if (!config.jwt.secret) {
      throw new Error('JWT secret is not configured');
    }

    const accessTokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId!,
      type: 'access'
    };

    const refreshTokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId!,
      type: 'refresh'
    };

    const accessToken = (jwt as any).sign(accessTokenPayload, config.jwt.secret as string, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'flowence',
      audience: 'flowence-users'
    });

    const refreshToken = (jwt as any).sign(refreshTokenPayload, config.jwt.secret as string, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'flowence',
      audience: 'flowence-users'
    });

    return { accessToken, refreshToken };
  }

  private getTokenExpiration(): number {
    // Convert expiration time to seconds
    const expiresIn = config.jwt.expiresIn;
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 3600;
    } else if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 86400;
    }
    return 1800; // Default 30 minutes
  }

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

  async close(): Promise<void> {
    await supabaseService.close();
  }
}