# Flowence - Implementation Plan (Multi-Store Architecture)

## Project Overview
This document outlines the detailed implementation plan for Flowence with **multi-store capability from the ground up**. Each owner can manage multiple stores with complete data isolation.

## Implementation Timeline
**Total Duration:** 13 weeks  
**Team Size:** 1-3 developers  
**Methodology:** Agile with weekly sprints  
**Architecture:** Multi-store first approach  

---

## Phase 1: Foundation & Multi-Store Setup (Weeks 1-3)

### Sprint 1.1: Project Initialization & Database (Week 1)

#### 📦 Backend Setup
- [ ] Initialize Node.js project with TypeScript
- [ ] Set up Express server with security middleware
- [ ] Configure ESLint, Prettier, and Jest
- [ ] Set up environment configuration (.env)
- [ ] Create folder structure following best practices

**Deliverables:**
- ✅ Express server running on port 3001
- ✅ TypeScript compilation working
- ✅ Basic middleware stack (CORS, helmet, morgan)

#### 🗄️ Database Setup (Multi-Store Schema)
- [ ] Set up Supabase project
- [ ] Create migration system
- [ ] Design multi-store schema
  - users table
  - stores table (with owner_id)
  - user_stores junction table (many-to-many)
  - products table (with store_id)
  - sales table (with store_id)
  - sale_items table
  - invitations table (with store_id)
- [ ] Set up database connection with Supabase
- [ ] Create seed data for testing

**Deliverables:**
- ✅ Database schema with multi-store support
- ✅ Migration files created
- ✅ Connection to Supabase working
- ✅ Seed data with 1 owner, 2 stores, sample products

**Migration Files:**
```
001_create_users.sql
002_create_stores.sql
003_create_user_stores.sql
004_create_products.sql
005_create_sales.sql
006_create_sale_items.sql
007_create_invitations.sql
```

#### 🎨 Frontend Setup
- [ ] Initialize Next.js 14+ project with TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up app router structure
- [ ] Configure environment variables
- [ ] Create basic layout components

**Deliverables:**
- ✅ Next.js app running on port 3000
- ✅ Tailwind CSS configured
- ✅ Basic app router structure

**Folder Structure:**
```
flowence-client/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── stores/
│   │   │   ├── products/
│   │   │   └── sales/
│   │   └── layout.tsx
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   └── types/
```

---

### Sprint 1.2: Authentication System (Week 2)

#### 🔐 Backend Authentication
- [ ] Create User model with Supabase integration
- [ ] Implement registration endpoint
  - Create user in Supabase Auth
  - Create user record in users table
  - Create first store automatically
  - Create user_stores relationship
- [ ] Implement login endpoint
  - Authenticate with Supabase
  - Generate JWT token
  - Return user data + accessible stores
- [ ] Create authentication middleware
- [ ] Implement token refresh endpoint
- [ ] Create logout endpoint

**Deliverables:**
- ✅ POST /api/auth/register - Creates user + first store
- ✅ POST /api/auth/login - Returns token + stores array
- ✅ GET /api/auth/me - Returns current user + stores
- ✅ POST /api/auth/refresh - Refreshes JWT token
- ✅ POST /api/auth/logout - Invalidates token
- ✅ Authentication middleware validates JWT

**Key Files:**
```
server/src/
├── controllers/AuthController.ts
├── models/UserModel.ts
├── middleware/auth.ts
├── routes/auth.ts
├── services/AuthService.ts
└── types/user.ts
```

#### 🎨 Frontend Authentication
- [ ] Create AuthContext with user + stores state
- [ ] Implement register page
  - Email, password, name, store name
  - Validation with Zod
  - Error handling
- [ ] Implement login page
  - Email, password
  - Remember me option
  - Error handling
- [ ] Create ProtectedRoute component
- [ ] Implement token storage (httpOnly cookies)
- [ ] Create useAuth hook

**Deliverables:**
- ✅ Registration flow complete
- ✅ Login flow complete
- ✅ Protected routes working
- ✅ Session persistence
- ✅ Logout functionality

**Key Files:**
```
flowence-client/src/
├── contexts/AuthContext.tsx
├── app/(auth)/login/page.tsx
├── app/(auth)/register/page.tsx
├── components/auth/ProtectedRoute.tsx
└── hooks/useAuth.ts
```

---

### Sprint 1.3: Multi-Store Core Implementation (Week 3)

#### 🏪 Backend Store Management
- [ ] Create Store model
- [ ] Create UserStore model (junction table)
- [ ] Implement store CRUD endpoints
  - GET /api/stores - Get all user's stores
  - POST /api/stores - Create new store (owners only)
  - GET /api/stores/:id - Get store details
  - PUT /api/stores/:id - Update store
  - DELETE /api/stores/:id - Delete store
- [ ] Create store access middleware
- [ ] Implement store ownership validation

**Deliverables:**
- ✅ Complete store management API
- ✅ Store access validation middleware
- ✅ Owner can create multiple stores
- ✅ User-store relationships working

**Key Files:**
```
server/src/
├── controllers/StoreController.ts
├── models/StoreModel.ts
├── models/UserStoreModel.ts
├── middleware/storeAccess.ts
└── routes/stores.ts
```

#### 🎨 Frontend Store Management
- [ ] Create StoreContext for current store state
- [ ] Implement store selector component
- [ ] Create stores management page (for owners)
- [ ] Implement store creation form
- [ ] Create store settings page
- [ ] Implement store switching functionality
- [ ] Add store persistence (localStorage)

**Deliverables:**
- ✅ StoreContext managing current store
- ✅ Store selector in header
- ✅ Store creation flow
- ✅ Store switching without re-login
- ✅ Current store persisted across sessions
- ✅ Visual indicator of current store

**Key Files:**
```
flowence-client/src/
├── contexts/StoreContext.tsx
├── app/(dashboard)/stores/page.tsx
├── app/(dashboard)/stores/new/page.tsx
├── components/layout/StoreSelector.tsx
├── components/stores/StoreCard.tsx
└── hooks/useStore.ts
```

#### 🧪 Testing Phase 1
- [ ] Test user registration creates first store
- [ ] Test owner can create additional stores
- [ ] Test store switching updates context
- [ ] Test employees only see assigned store
- [ ] Test store access validation

**Phase 1 Acceptance Criteria:**
- ✅ Owner can register and auto-create first store
- ✅ Owner can create unlimited additional stores
- ✅ Owner can switch between stores seamlessly
- ✅ Current store context maintained
- ✅ Store name visible in UI at all times
- ✅ Authentication persists across page refreshes

---

## Phase 2: Inventory & User Management (Weeks 4-6)

### Sprint 2.1: Invitation System (Week 4)

#### 📧 Backend Invitation System
- [ ] Create Invitation model (with store_id)
- [ ] Implement invitation creation endpoint
- [ ] Set up email service (SendGrid)
- [ ] Create invitation token generation
- [ ] Implement invitation acceptance endpoint
- [ ] Create invitation expiration logic (24 hours)
- [ ] Add invitation status tracking

**Deliverables:**
- ✅ POST /api/invitations - Create invitation for store
- ✅ GET /api/invitations/:token - Get invitation details
- ✅ POST /api/invitations/:token/accept - Accept invitation
- ✅ GET /api/stores/:id/invitations - List store invitations
- ✅ Email sent with invitation link
- ✅ Invitation expires after 24 hours

#### 👥 User Management per Store
- [ ] Implement user list endpoint (per store)
- [ ] Create user role update endpoint
- [ ] Implement user removal from store
- [ ] Add user access validation

**Deliverables:**
- ✅ GET /api/stores/:id/users - List store employees
- ✅ PUT /api/stores/:id/users/:user_id - Update role
- ✅ DELETE /api/stores/:id/users/:user_id - Remove user
- ✅ Only owners can manage users

#### 🎨 Frontend Invitation UI
- [ ] Create user management page per store
- [ ] Implement invitation form
- [ ] Create pending invitations list
- [ ] Implement invitation acceptance page
- [ ] Add user list with roles
- [ ] Create user removal confirmation

**Deliverables:**
- ✅ User management UI per store
- ✅ Invitation sending interface
- ✅ Invitation acceptance flow
- ✅ User role management

---

### Sprint 2.2: Inventory Management - Part 1 (Week 5)

#### 📦 Backend Product Management
- [ ] Create Product model (with store_id)
- [ ] Implement product CRUD endpoints
  - GET /api/products?store_id={id}
  - POST /api/products
  - GET /api/products/:id
  - PUT /api/products/:id
  - DELETE /api/products/:id
- [ ] Add product validation (unique barcode per store)
- [ ] Implement product search and filtering
- [ ] Create product categories

**Deliverables:**
- ✅ Complete product API with store context
- ✅ Products are store-specific
- ✅ Barcode unique per store (not globally)
- ✅ Search and filter functionality

**Key Fields:**
```typescript
interface Product {
  id: string;
  store_id: string; // ⭐ Store association
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  category?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### 🎨 Frontend Product Management
- [ ] Create products page (filtered by current store)
- [ ] Implement product creation form
- [ ] Create product list with pagination
- [ ] Add product search and filters
- [ ] Implement product editing
- [ ] Create product deletion confirmation

**Deliverables:**
- ✅ Full product CRUD interface
- ✅ Products filtered by current store
- ✅ Search and filter working
- ✅ Responsive design for tablet use

---

### Sprint 2.3: Inventory Management - Part 2 (Week 6)

#### 📊 Stock Management
- [ ] Implement stock adjustment endpoint
- [ ] Create low stock alerts (per store)
- [ ] Add stock history tracking
- [ ] Implement bulk stock updates
- [ ] Create stock validation on sales

**Deliverables:**
- ✅ Stock adjustments working
- ✅ Low stock alerts per store
- ✅ Stock history audit trail
- ✅ Bulk operations supported

#### 🎨 Frontend Stock Management
- [ ] Create stock adjustment interface
- [ ] Implement low stock alert display
- [ ] Add stock history view
- [ ] Create bulk import functionality
- [ ] Implement product categories

**Deliverables:**
- ✅ Complete inventory management
- ✅ Stock alerts visible
- ✅ Bulk operations UI
- ✅ Category management

---

## Phase 3: Sales & Scanner Integration (Weeks 7-9)

### Sprint 3.1: Barcode Scanner (Week 7)

#### 📷 Scanner Integration
- [ ] Integrate QuaggaJS library
- [ ] Implement camera access
- [ ] Create scanner component
- [ ] Add barcode detection
- [ ] Implement manual entry fallback
- [ ] Create scanner error handling

**Deliverables:**
- ✅ Barcode scanner working
- ✅ Camera permissions handled
- ✅ Manual entry as fallback
- ✅ Works on mobile and tablet

#### 🔍 Product Lookup
- [ ] Implement product search by barcode (current store)
- [ ] Add product not found handling
- [ ] Create quick add product from scanner
- [ ] Implement product preview

**Deliverables:**
- ✅ Scanner finds products in current store only
- ✅ Option to create product if not found
- ✅ Product preview after scan

---

### Sprint 3.2: Sales Processing - Part 1 (Week 8)

#### 🛒 Shopping Cart Backend
- [ ] Create Sale model (with store_id)
- [ ] Create SaleItem model
- [ ] Implement cart validation
- [ ] Add stock availability check
- [ ] Create tax calculation logic

**Deliverables:**
- ✅ Sale data model with store context
- ✅ Stock validation before sale
- ✅ Tax calculation per store settings

#### 🎨 Shopping Cart Frontend
- [ ] Create cart context
- [ ] Implement cart component
- [ ] Add item quantity controls
- [ ] Create cart summary
- [ ] Implement cart persistence
- [ ] Add cart validation

**Deliverables:**
- ✅ Full shopping cart functionality
- ✅ Real-time totals calculation
- ✅ Cart state management
- ✅ Stock validation

---

### Sprint 3.3: Sales Processing - Part 2 (Week 9)

#### 💳 Payment Processing
- [ ] Implement cash payment endpoint
- [ ] Integrate Stripe for card payments
- [ ] Create payment validation
- [ ] Implement receipt generation (PDF)
- [ ] Add sales history endpoint
- [ ] Create stock update on sale

**Deliverables:**
- ✅ POST /api/sales - Process sale (cash/card)
- ✅ GET /api/sales?store_id={id} - Sales history
- ✅ GET /api/sales/:id/receipt - Download receipt
- ✅ Stock auto-updates on completed sale
- ✅ Sales recorded with store_id

#### 🎨 Payment & Receipt UI
- [ ] Create checkout interface
- [ ] Implement payment method selection
- [ ] Add Stripe card input
- [ ] Create receipt display
- [ ] Implement receipt download/print
- [ ] Add sales history page

**Deliverables:**
- ✅ Complete checkout flow
- ✅ Payment processing UI
- ✅ Receipt generation
- ✅ Sales history per store

#### ↩️ Returns Functionality
- [ ] Implement sale return endpoint
- [ ] Add stock restoration
- [ ] Create return validation
- [ ] Implement return history

**Deliverables:**
- ✅ Basic return functionality
- ✅ Stock restored on return
- ✅ Return audit trail

---

## Phase 4: Store Configuration & Polish (Weeks 10-11)

### Sprint 4.1: Store Configuration (Week 10)

#### ⚙️ Store Settings
- [ ] Implement store configuration endpoints
- [ ] Add currency settings
- [ ] Create tax rate configuration
- [ ] Implement alert threshold settings
- [ ] Add store branding (logo upload)

**Deliverables:**
- ✅ Complete store settings API
- ✅ Per-store configuration
- ✅ Settings validation

#### 🎨 Settings UI
- [ ] Create settings page per store
- [ ] Implement settings forms
- [ ] Add image upload for logo
- [ ] Create settings preview
- [ ] Implement settings validation

**Deliverables:**
- ✅ Store settings interface
- ✅ Logo upload working
- ✅ Settings persist per store

---

### Sprint 4.2: Dashboard & Polish (Week 11)

#### 📊 Multi-Store Dashboard
- [ ] Create dashboard overview for owners
- [ ] Show metrics for all stores
- [ ] Implement store comparison
- [ ] Add recent activity feed
- [ ] Create quick actions

**Deliverables:**
- ✅ Owner sees all stores overview
- ✅ Key metrics per store
- ✅ Quick store switching

#### 🎨 UI/UX Polish
- [ ] Improve responsive design
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Create empty states
- [ ] Add tooltips and help text
- [ ] Implement animations

**Deliverables:**
- ✅ Professional, polished UI
- ✅ Excellent mobile experience
- ✅ Consistent design system
- ✅ Accessibility improvements

---

## Phase 5: Testing & Deployment (Weeks 12-13)

### Sprint 5.1: Testing (Week 12)

#### 🧪 Backend Testing
- [ ] Unit tests for models
- [ ] Controller tests
- [ ] Integration tests for API
- [ ] Multi-store isolation tests
- [ ] Authentication tests
- [ ] Store access validation tests

**Target Coverage:** 70%+

#### 🧪 Frontend Testing
- [ ] Component tests
- [ ] Context tests
- [ ] Hook tests
- [ ] E2E tests with Playwright
- [ ] Multi-store flow tests

**Test Scenarios:**
- Owner creates multiple stores
- Owner switches between stores
- Employee only sees assigned store
- Data isolation between stores
- Complete sales flow per store

#### 🔒 Security Audit
- [ ] SQL injection testing
- [ ] XSS vulnerability testing
- [ ] Authentication security review
- [ ] Store access control testing
- [ ] Data isolation verification

**Deliverables:**
- ✅ All critical paths tested
- ✅ Security vulnerabilities addressed
- ✅ Multi-store scenarios validated

---

### Sprint 5.2: Deployment (Week 13)

#### 🚀 Production Setup
- [ ] Set up production database (Supabase)
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure error monitoring (Sentry)
- [ ] Set up logging system
- [ ] Implement backup strategy

**Deliverables:**
- ✅ Production environment ready
- ✅ CI/CD pipeline working
- ✅ Monitoring in place

#### 📚 Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Admin guide for store management
- [ ] Developer documentation
- [ ] Deployment guide

**Deliverables:**
- ✅ Complete documentation
- ✅ User onboarding guide
- ✅ Admin documentation

#### 🎉 Launch
- [ ] Beta user testing
- [ ] Bug fixes from testing
- [ ] Performance optimization
- [ ] Final security review
- [ ] Production deployment

**Launch Checklist:**
- ✅ All features working
- ✅ Tests passing
- ✅ Documentation complete
- ✅ Monitoring active
- ✅ Backup system working

---

## Technical Stack Summary

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context
- **Forms:** React Hook Form + Zod
- **Scanner:** QuaggaJS
- **HTTP:** Fetch API

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT + Supabase Auth
- **Validation:** Zod
- **Payments:** Stripe
- **Email:** SendGrid
- **Testing:** Jest + Supertest

### DevOps
- **Frontend Host:** Vercel
- **Backend Host:** Railway/Render
- **Database:** Supabase
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Logs:** Winston

---

## Success Criteria

### Phase 1 Complete ✅
- [ ] Owner can register with first store
- [ ] Owner can create additional stores
- [ ] Owner can switch between stores
- [ ] Store context maintained across app
- [ ] Authentication working properly

### Phase 2 Complete ✅
- [ ] Invitation system working per store
- [ ] Full inventory management per store
- [ ] Products isolated by store
- [ ] User management per store

### Phase 3 Complete ✅
- [ ] Barcode scanner working
- [ ] Complete sales processing
- [ ] Payment integration
- [ ] Receipt generation
- [ ] Stock updates automatic

### Phase 4 Complete ✅
- [ ] Store configuration system
- [ ] Multi-store dashboard
- [ ] Polished UI/UX
- [ ] Mobile responsive

### Phase 5 Complete ✅
- [ ] Tests passing (70%+ coverage)
- [ ] Production deployed
- [ ] Documentation complete
- [ ] Monitoring active

---

## Multi-Store Specific Considerations

### Data Isolation
- Every query includes store_id filter
- Database constraints enforce isolation
- Middleware validates store access
- Visual indicators of current store

### Performance
- Indexes on store_id columns
- Efficient store switching
- Cached store settings
- Optimized queries

### User Experience
- Clear current store indicator
- Easy store switching
- Store-specific dashboards
- Multi-store overview for owners

### Security
- Store access validation at every endpoint
- Role verification per store
- Data isolation at database level
- Audit logs include store context

---

**Last Updated:** October 9, 2025  
**Version:** 1.0 - Multi-Store Implementation  
**Status:** Ready to Start Phase 1
