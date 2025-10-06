import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { StoreModel } from '../models/Store';
import { User, LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from '../types';
import { config } from '../config';
import { AuthenticationError, ValidationError, ConflictError } from '../types';

export class AuthService {
  private userModel: UserModel;
  private storeModel: StoreModel;

  constructor() {
    this.userModel = new UserModel();
    this.storeModel = new StoreModel();
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(registerData.password);
      if (!passwordValidation.isValid) {
        throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
      }

      // Create user
      const user = await this.userModel.create({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        role: 'owner'
      });

      // Create store for the owner
      const store = await this.storeModel.create({
        name: registerData.storeName,
        currency: 'USD',
        taxRate: 0,
        lowStockThreshold: 5
      }, user.id);

      // Update user with store ID
      const updatedUser = await this.userModel.update(user.id, {
        storeId: store.id
      });

      // Generate tokens
      const tokens = this.generateTokens(updatedUser);

      return {
        user: updatedUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpiration()
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate user credentials
      const user = await this.userModel.validatePassword(loginData.email, loginData.password);
      
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      return {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpiration()
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;
      
      if (payload.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
      }

      // Get user
      const user = await this.userModel.findById(payload.userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpiration()
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Validate current password
      const isValidPassword = await this.userModel.validatePassword(user.email, currentPassword);
      if (!isValidPassword) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
      }

      // Update password
      await this.userModel.updatePassword(userId, newPassword);
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Password change failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return;
      }

      // TODO: Implement email sending for password reset
      // For now, just log the reset request
      console.log(`Password reset requested for user: ${email}`);
    } catch (error) {
      throw new Error('Password reset request failed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify reset token
      const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      if (payload.type !== 'reset') {
        throw new AuthenticationError('Invalid token type');
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
      }

      // Update password
      await this.userModel.updatePassword(payload.userId, newPassword);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid or expired reset token');
      }
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    // TODO: Implement token blacklisting with Redis
    // For now, just log the logout
    console.log(`User ${userId} logged out`);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
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

    const accessToken = jwt.sign(accessTokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'flowence',
      audience: 'flowence-users'
    });

    const refreshToken = jwt.sign(refreshTokenPayload, config.jwt.secret, {
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
    await this.userModel.close();
    await this.storeModel.close();
  }
}

