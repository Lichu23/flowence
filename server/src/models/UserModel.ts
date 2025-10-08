import { BaseModel } from './BaseModel';
import { supabaseService } from '../services/SupabaseService';
import { User } from '../types';

export class UserModel extends BaseModel {
  async findById(id: string): Promise<User | null> {
    try {
      return await supabaseService.getUserById(id);
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  async findByStore(storeId: string): Promise<User[]> {
    try {
      return await supabaseService.getUsers(storeId);
    } catch (error) {
      return [];
    }
  }

  async create(userData: {
    email: string;
    name: string;
    role: 'owner' | 'employee';
    storeId?: string;
  }): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        store_id: userData.storeId,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Create user');
    }

    return data;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'Update user');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      this.handleError(error, 'Delete user');
    }
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    try {
      // This method is now handled by Supabase Auth
      // We'll use signIn and then fetch user data
      const authData = await supabaseService.signIn(email, password);
      
      if (!authData.user) {
        return null;
      }

      return await this.findById(authData.user.id);
    } catch (error) {
      return null;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      this.handleError(error, 'Update password');
    }
  }
}
