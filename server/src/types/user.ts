export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'employee';
  storeId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  store?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
}

export interface UserStats {
  totalSales: number;
  totalRevenue: number;
  averageSaleAmount: number;
  lastSaleDate?: Date;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: 'employee';
  storeId: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}



