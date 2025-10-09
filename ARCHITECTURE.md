# Flowence - System Architecture (Multi-Store Edition)

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Multi-Store Architecture](#multi-store-architecture)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Frontend Architecture](#frontend-architecture)
9. [Store Context Management](#store-context-management)
10. [Scalability Considerations](#scalability-considerations)

## Architecture Overview

Flowence follows a modern, scalable architecture with **multi-store support from the ground up**. Each owner can manage multiple stores, with complete data isolation between stores.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   + Store       │    │   + Store       │    │   + Store       │
│   Context       │    │   Middleware    │    │   Isolation     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Principles
- **Multi-Store First**: Every data model includes store_id for isolation
- **Store Context**: Active store maintained throughout user session
- **Data Isolation**: Database-level constraints ensure store separation
- **Scalable**: Owner can manage 1 to 100+ stores with same architecture
- **Security First**: Role and store access validated at every layer

## Multi-Store Architecture

### Core Concept
```
Owner Account
    ├── Store 1 (Coffee Shop Downtown)
    │   ├── Products (100 items)
    │   ├── Employees (5 users)
    │   └── Sales (Daily transactions)
    │
    ├── Store 2 (Coffee Shop Uptown)
    │   ├── Products (120 items)
    │   ├── Employees (3 users)
    │   └── Sales (Daily transactions)
    │
    └── Store 3 (Coffee Shop Airport)
        ├── Products (80 items)
        ├── Employees (8 users)
        └── Sales (Daily transactions)
```

### Key Relationships

#### User-Store Relationship (Many-to-Many)
```
Users ←→ UserStores ←→ Stores
```

- **Owners**: Can have multiple stores they own
- **Employees**: Typically assigned to one store (can be multiple in future)
- **UserStores**: Junction table with role per store

#### Data Hierarchy
```
Store
 ├── Products (One-to-Many)
 ├── Sales (One-to-Many)
 │   └── SaleItems (One-to-Many)
 ├── Invitations (One-to-Many)
 └── UserStores (One-to-Many)
```

## System Components

### Frontend Layer (Next.js App)
```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected routes
│   │   ├── dashboard/       # Multi-store overview
│   │   ├── stores/          # Store management
│   │   ├── products/        # Inventory (per store)
│   │   ├── sales/           # Sales (per store)
│   │   ├── users/           # User management (per store)
│   │   └── settings/        # Store settings
│   └── layout.tsx           # Root layout with store context
│
├── components/
│   ├── auth/                # Login, Register, ProtectedRoute
│   ├── layout/              # Sidebar, Header, StoreSelector
│   ├── stores/              # StoreCard, StoreForm, StoreList
│   ├── products/            # ProductList, ProductForm
│   ├── sales/               # Scanner, Cart, Checkout
│   └── ui/                  # Reusable UI components
│
├── contexts/
│   ├── AuthContext.tsx      # User authentication state
│   ├── StoreContext.tsx     # Current store context ⭐
│   └── CartContext.tsx      # Shopping cart state
│
├── hooks/
│   ├── useAuth.ts           # Authentication hooks
│   ├── useStore.ts          # Store context hooks ⭐
│   ├── useApi.ts            # API calls with store context
│   └── useLocalStorage.ts   # Local storage utilities
│
└── types/
    └── index.ts             # TypeScript definitions
```

### Backend Layer (Node.js/Express)
```
server/
├── controllers/
│   ├── AuthController.ts    # Register, Login, Logout
│   ├── StoreController.ts   # Store CRUD ⭐
│   ├── ProductController.ts # Product CRUD (per store)
│   ├── SaleController.ts    # Sales (per store)
│   └── UserController.ts    # User management
│
├── middleware/
│   ├── auth.ts              # JWT authentication
│   ├── storeAccess.ts       # Store access validation ⭐
│   ├── roleCheck.ts         # Role-based permissions
│   └── errorHandler.ts      # Global error handling
│
├── models/
│   ├── UserModel.ts
│   ├── StoreModel.ts        # ⭐
│   ├── UserStoreModel.ts    # Many-to-many ⭐
│   ├── ProductModel.ts      # Includes store_id
│   ├── SaleModel.ts         # Includes store_id
│   └── InvitationModel.ts   # Includes store_id
│
├── routes/
│   ├── auth.ts
│   ├── stores.ts            # ⭐
│   ├── products.ts
│   ├── sales.ts
│   └── users.ts
│
└── services/
    ├── AuthService.ts
    ├── StoreService.ts      # ⭐
    └── SupabaseService.ts
```

## Data Flow

### Multi-Store Authentication Flow
```
1. User Login Request
   ↓
2. Backend validates credentials
   ↓
3. Fetch user's accessible stores
   ↓
4. Generate JWT with user_id + default_store_id
   ↓
5. Return token + user info + stores array
   ↓
6. Frontend stores token + sets active store
   ↓
7. All subsequent requests include store context
```

### Store Switching Flow
```
1. User clicks store selector
   ↓
2. Select different store from list
   ↓
3. Update StoreContext with new store_id
   ↓
4. Frontend refetches data for new store
   ↓
5. All API calls now use new store_id
   ↓
6. Store preference saved to localStorage
```

### Product Management Flow (With Store Context)
```
1. Owner navigates to Products
   ↓
2. API GET /api/products?store_id={active_store}
   ↓
3. Backend validates user has access to store
   ↓
4. Fetch products WHERE store_id = active_store
   ↓
5. Return filtered products
   ↓
6. Frontend displays store-specific products
```

### Sales Processing Flow (With Store Context)
```
1. Employee scans product
   ↓
2. Frontend verifies product exists in CURRENT store
   ↓
3. Add to cart (local state)
   ↓
4. Confirm sale → POST /api/sales
   {
     store_id: active_store_id,
     items: [...],
     payment: {...}
   }
   ↓
5. Backend validates:
   - User has access to store
   - All products belong to this store
   - Stock is available
   ↓
6. Process payment + update inventory
   ↓
7. Create sale record with store_id
   ↓
8. Return receipt
```

## Security Architecture

### Store Access Validation

#### Middleware Stack
```typescript
// Every protected route goes through:
app.use('/api/*', [
  authenticate,      // Verify JWT token
  extractStoreContext, // Get store_id from request
  validateStoreAccess, // Verify user can access store ⭐
  roleCheck          // Verify user has required role
]);
```

#### Store Access Validation Logic
```typescript
// middleware/storeAccess.ts
export const validateStoreAccess = async (req, res, next) => {
  const userId = req.user.id;
  const storeId = req.body.store_id || req.query.store_id || req.params.store_id;
  
  // Check if user has access to this store
  const hasAccess = await UserStoreModel.checkAccess(userId, storeId);
  
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: 'You do not have access to this store'
    });
  }
  
  // Attach store context to request
  req.storeId = storeId;
  next();
};
```

### Data Isolation Strategy

#### Database Level
```sql
-- All data queries include store_id filter
SELECT * FROM products WHERE store_id = $1;

-- Foreign key constraints
ALTER TABLE products
ADD CONSTRAINT fk_products_store
FOREIGN KEY (store_id) REFERENCES stores(id)
ON DELETE CASCADE;

-- Row-level security (Supabase/PostgreSQL)
CREATE POLICY store_isolation ON products
USING (store_id IN (
  SELECT store_id FROM user_stores
  WHERE user_id = auth.uid()
));
```

#### Application Level
```typescript
// All model methods require store_id
ProductModel.findAll(storeId: string)
ProductModel.create(storeId: string, data: ProductData)
SaleModel.findByStore(storeId: string)
```

## Database Design

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'employee')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### stores ⭐
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_stores_owner (owner_id)
);
```

#### user_stores ⭐ (Many-to-Many)
```sql
CREATE TABLE user_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'employee')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, store_id),
  INDEX idx_user_stores_user (user_id),
  INDEX idx_user_stores_store (store_id)
);
```

#### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE, ⭐
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(store_id, barcode), ⭐ -- Barcode unique per store
  INDEX idx_products_store (store_id),
  INDEX idx_products_barcode (barcode)
);
```

#### sales
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE, ⭐
  user_id UUID NOT NULL REFERENCES users(id),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sales_store (store_id),
  INDEX idx_sales_user (user_id),
  INDEX idx_sales_created (created_at)
);
```

#### invitations
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE, ⭐
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_invitations_store (store_id),
  INDEX idx_invitations_token (token)
);
```

### Entity Relationship Diagram
```
                    ┌─────────────┐
                    │    Users    │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
           owner_id              user_id
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │   Stores    │──────│ UserStores  │
         └──────┬──────┘      └─────────────┘
                │
         store_id (FK)
                │
    ┌───────────┼───────────┬─────────────┐
    │           │           │             │
┌───▼───┐   ┌──▼──┐    ┌───▼────┐   ┌────▼────┐
│Product│   │Sales│    │Invites │   │Settings │
└───────┘   └──┬──┘    └────────┘   └─────────┘
                │
           ┌────▼────┐
           │SaleItems│
           └─────────┘
```

## API Design

### Store Management Endpoints ⭐

```typescript
// Get all stores for logged-in user
GET /api/stores
Response: {
  success: true,
  data: [
    { id, name, address, role: 'owner', ... },
    { id, name, address, role: 'employee', ... }
  ]
}

// Create new store (owners only)
POST /api/stores
Body: { name, address, phone, currency, tax_rate }
Response: { success: true, data: { store } }

// Get store details
GET /api/stores/:id
Response: { success: true, data: { store } }

// Update store (owners only)
PUT /api/stores/:id
Body: { name, address, ... }
Response: { success: true, data: { store } }

// Delete store (owners only)
DELETE /api/stores/:id
Response: { success: true, message: 'Store deleted' }
```

### Store-Aware Endpoints

All resource endpoints require store_id:

```typescript
// Products
GET    /api/products?store_id={id}
POST   /api/products { store_id, name, price, ... }
PUT    /api/products/:id { store_id, ... }
DELETE /api/products/:id?store_id={id}

// Sales
GET    /api/sales?store_id={id}
POST   /api/sales { store_id, items, payment, ... }
GET    /api/sales/:id?store_id={id}

// Users (per store)
GET    /api/stores/:store_id/users
POST   /api/stores/:store_id/invite { email, role }
DELETE /api/stores/:store_id/users/:user_id
```

### Response Format (With Store Context)
```json
{
  "success": true,
  "data": {
    "store_id": "uuid-123",
    "store_name": "Coffee Shop Downtown",
    "products": [...]
  },
  "message": "Products fetched successfully",
  "timestamp": "2025-10-09T12:00:00Z"
}
```

## Frontend Architecture

### Store Context Provider ⭐

```typescript
// contexts/StoreContext.tsx
interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  switchStore: (storeId: string) => void;
  refreshStores: () => Promise<void>;
  isLoading: boolean;
}

export const StoreProvider: React.FC = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  
  // Load user's stores on mount
  useEffect(() => {
    loadUserStores();
  }, []);
  
  // Load last active store from localStorage
  useEffect(() => {
    const lastStoreId = localStorage.getItem('lastActiveStore');
    if (lastStoreId && stores.length > 0) {
      switchStore(lastStoreId);
    } else if (stores.length > 0) {
      setCurrentStore(stores[0]); // Default to first store
    }
  }, [stores]);
  
  const switchStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('lastActiveStore', storeId);
    }
  };
  
  return (
    <StoreContext.Provider value={{
      currentStore,
      stores,
      switchStore,
      refreshStores: loadUserStores,
      isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
};
```

### Store Selector Component ⭐

```typescript
// components/layout/StoreSelector.tsx
export const StoreSelector: React.FC = () => {
  const { currentStore, stores, switchStore } = useStore();
  const { user } = useAuth();
  
  return (
    <div className="store-selector">
      <select 
        value={currentStore?.id} 
        onChange={(e) => switchStore(e.target.value)}
      >
        {stores.map(store => (
          <option key={store.id} value={store.id}>
            {store.name} {store.role === 'owner' ? '👑' : ''}
          </option>
        ))}
      </select>
      
      {user?.role === 'owner' && (
        <button onClick={() => navigate('/stores/new')}>
          + New Store
        </button>
      )}
    </div>
  );
};
```

### Store-Aware API Hook ⭐

```typescript
// hooks/useApi.ts
export const useApi = () => {
  const { currentStore } = useStore();
  
  const fetchProducts = async () => {
    if (!currentStore) throw new Error('No store selected');
    
    return api.get(`/products?store_id=${currentStore.id}`);
  };
  
  const createProduct = async (data: ProductData) => {
    if (!currentStore) throw new Error('No store selected');
    
    return api.post('/products', {
      ...data,
      store_id: currentStore.id
    });
  };
  
  return { fetchProducts, createProduct };
};
```

## Store Context Management

### Context Flow
```
User Login
    ↓
Fetch User's Stores
    ↓
Load Last Active Store (localStorage)
    ↓
Set Current Store Context
    ↓
All API Calls Include store_id
    ↓
Store Switch Requested
    ↓
Update Context + Refetch Data
```

### Context Persistence
- **localStorage**: Stores last active store_id
- **Session**: Current store maintained in React Context
- **Token**: JWT includes default store (optional optimization)

### Visual Indicators
- Store name always visible in header
- Store icon/color coding
- Breadcrumbs include store name
- Dashboard shows multi-store overview for owners

## Scalability Considerations

### Database Optimization
```sql
-- Composite indexes for common queries
CREATE INDEX idx_products_store_category ON products(store_id, category);
CREATE INDEX idx_sales_store_date ON sales(store_id, created_at DESC);
CREATE INDEX idx_user_stores_user_role ON user_stores(user_id, role);
```

### Caching Strategy
- Cache user's stores list (refresh on store creation)
- Cache store settings per store_id
- Invalidate cache on store update

### Query Performance
```typescript
// Good: Filter by store_id at database level
SELECT * FROM products WHERE store_id = $1;

// Bad: Fetch all and filter in application
SELECT * FROM products; // Filter in JS
```

### Horizontal Scaling
- Stateless backend (store context in request)
- Database connection pooling
- CDN for static assets
- Load balancer for multiple instances

## Future Enhancements

### Phase 2+ Features
- Employee can work at multiple stores
- Store groups/chains management
- Cross-store inventory transfer
- Consolidated reporting across stores
- Store-to-store comparisons
- Franchise management features

---

**Last Updated:** October 9, 2025  
**Version:** 1.0 - Multi-Store Architecture  
**Status:** Foundation Document
