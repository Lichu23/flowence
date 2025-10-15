# Flowence - Project Tracker (Multi-Store Architecture)

## Project Overview
**Project Name:** Flowence - All-in-One Multi-Store Management App  
**Version:** 1.0 (MVP) - Multi-Store Edition  
**Start Date:** October 2025  
**Target Completion:** [To be defined]  
**Status:** Phase 1 - Foundation & Setup  

## Key Architecture Difference
**🏪 Multi-Store Capability:** Each owner can manage **multiple stores**. Employees belong to specific stores within an owner's organization.

## Project Goals
- Reduce manual errors in inventory and sales by 50%
- Enable owners to manage multiple store locations from a single account
- Facilitate collaboration between owners and employees across different stores
- Accelerate sales process (minutes to seconds via scanner)
- Provide accessible, low-cost tool for Latin America/Spain entrepreneurs

## Success Metrics
- **Adoption:** 10+ beta users (owners) managing 15+ stores in first month
- **Usage:** 80% of sales processed via app without errors
- **Feedback:** NPS > 7/10 in initial tests
- **Technical:** Response time < 2s per action; 99% uptime
- **Multi-Store:** Seamless store switching without logout

## Milestones

### Phase 1: Foundation & Multi-Store Setup (Weeks 1-3) ✅ COMPLETADO (100%)
**Goal:** Establish the foundation with multi-store architecture from the beginning

**Status:** ✅ Backend Complete | ✅ Frontend Complete

#### Sprint 1.1: Project Setup & Database (Week 1) ✅ COMPLETADO
- [x] Project initialization (TypeScript, Node.js, React)
- [x] Database schema design with multi-store relationships
- [x] Development environment configuration
- [x] Basic security middleware
- [x] Documentation structure

**Deliverables:**
- [x] Working development environment
- [x] Database schema with multi-store support
- [x] Basic Express server setup
- [x] React frontend initialized


#### Sprint 1.2: Authentication System (Week 2) ✅ COMPLETADO
- [x] User registration and login (JWT-based)
- [x] Owner account creation with first store
- [x] Role-based access control (Owner, Employee)
- [x] Password management and security
- [x] Token refresh mechanism

**Deliverables:**
- [x] Complete authentication system
- [x] User registration creates owner + initial store
- [x] Login returns user with accessible stores
- [x] Protected routes and middleware
- [x] Store management API (CRUD completo)
- [ ] Frontend authentication context (Pending - Sprint 1.3)

#### Sprint 1.3: Multi-Store Core (Week 3) ✅ COMPLETADO
- [x] Store creation and management for owners (Backend + Frontend ✅)
- [x] Store switching mechanism (context/session) (Frontend ✅)
- [x] User-Store relationships (many-to-many) (Backend ✅)
- [x] Store selection UI (Frontend ✅)
- [x] Store context provider (Frontend ✅)

**Deliverables:**
- [x] Owners can create multiple stores (Backend + Frontend ✅)
- [x] Store switching without re-authentication
- [x] Store context maintained across sessions
- [x] UI for store management
- [x] Store selector component

**Phase 1 Completion Criteria:**
- ✅ Owner can register and create account (Sprint 1.2)
- ✅ First store is automatically created on registration (Sprint 1.2)
- ✅ Owner can create additional stores via API and UI (Sprint 1.2 + 1.3)
- ✅ Owner can switch between stores via UI (Sprint 1.3)
- ✅ Authentication persists store context (Sprint 1.3)
- ✅ Role-based access control working (Sprint 1.2)

### Phase 2: Inventory & User Management (Weeks 4-6)
**Goal:** Implement inventory management per store and user invitation system

#### Sprint 2.1: Invitation System (Week 4) ✅ COMPLETADO
- [x] Email invitation system for employees
- [x] Invitation links with store association
- [x] Employee acceptance and account creation
- [x] User-store assignment
- [x] Employee list per store

**Deliverables:**
- [x] Owners can invite employees to specific stores
- [x] Employees can accept invitations
- [x] Employee dashboard shows assigned store only
- [x] User management UI per store

**Nota:** SendGrid integration pendiente (opcional), invitaciones funcionan con URL manual.

#### Sprint 2.2: Inventory Management - Part 1 (Week 5)
- [x] Product model with store association
- [x] Product CRUD operations
- [x] Product list with search and filters
- [x] Stock tracking per store
- [x] Product categories

**Deliverables:**
- [x] Products are store-specific
- [x] Full CRUD for products
- [x] Search and filter functionality
- [x] Basic stock management  

#### Sprint 2.3: Advanced Stock Management & Role-Based Permissions (Week 6)
**🎯 Goal:** Implement dual-stock system with role-based stock management

**Core Features:**
- [x] Dual stock system implementation
  - [x] `stock_deposito`: Warehouse/storage stock (owner only)
  - [x] `stock_venta`: Sales floor stock (all roles can view, employees can restock)
- [x] Role-based stock permissions
  - [x] Employee: Can only restock sales stock from warehouse stock
  - [x] Owner: Full control over both stock types
- [x] Stock operations
  - [x] Restock operation (sales ← warehouse) 
  - [x] Warehouse stock adjustments (owner only)
  - [x] Low stock alerts for both stock types
- [x] Enhanced stock management
  - [x] Stock movement history/audit trail
  - [x] Product validation rules
  - [ ] Bulk stock adjustments (future enhancement)

**Permission Matrix:**
- **Employee (común):** 
  - ✅ View both stocks
  - ✅ Restock sales from warehouse (auto-deduct)
  - ✅ Edit sales floor stock only
  - ❌ Direct warehouse stock modification
- **Owner (encargado):**
  - ✅ Full warehouse stock management
  - ✅ Fill/add warehouse stock
  - ✅ Direct stock adjustments (both stocks)
  - ✅ All employee permissions

**Deliverables:**
- [x] Dual stock database schema (migrations 009 & 010)
- [x] Role-based stock API endpoints (7 endpoints)
- [x] Stock movement audit system (`stock_movements` table)
- [x] Enhanced inventory management UI (frontend updated)
- [x] Stock operation validations (all implemented)

**✅ Sprint 2.3 Status: COMPLETED** (Backend 100% + Frontend 100%)

### Phase 3: Sales & Scanner Integration (Weeks 7-9) ⚡ EN PROGRESO (66% Completado)
**Goal:** Implement sales processing with barcode scanning

**Status:** Sprint 3.1 ✅ | Sprint 3.2 ✅ | Sprint 3.3 ⏳ Pendiente

#### Sprint 3.1: Scanner Integration (Week 7) ✅ COMPLETADO (integrado en 3.2)
- [x] QuaggaJS integration
- [x] Barcode scanning functionality
- [x] Manual product entry fallback
- [x] Product search by barcode
- [x] Scanner configuration per store

**Deliverables:**
- [x] Working barcode scanner
- [x] Product lookup by barcode
- [x] Manual entry alternative
- [x] Scanner works on mobile/tablet

**✅ Sprint 3.1 Status: COMPLETED** (Integrado en Sprint 3.2)

#### Sprint 3.2: POS & Sales System (Week 8) ✅ COMPLETADO
- [x] POS (Point of Sale) page for employees
- [x] Shopping cart functionality (Context API)
- [x] Cart state management (add/remove/update)
- [x] Product search (manual + barcode scanner)
- [x] QuaggaJS barcode scanner integration
- [x] Scanner modal with dual mode (camera + manual)
- [x] Tax calculations per store (fixed calculation bug)
- [x] Payment method: Cash processing
- [x] Cash payment modal with change calculation
- [x] Stock validation before sale
- [x] Dual stock system (descuenta de stock_venta)
- [x] Sales database structure (sales + sale_items)
- [x] Stock movements tracking
- [x] Receipt number generation
- [x] Refresh token system (90 días, no expira en venta)
- [x] Role-based routing (Dashboard solo owners)
- [x] Responsive design (mobile/tablet optimizado)
- [x] Debugging logs en scanner

**Deliverables:**
- [x] POS page functional para empleados
- [x] Barcode scanner integrado (QuaggaJS)
- [x] Shopping cart completo con Context API
- [x] Store-specific tax rates (16% corregido)
- [x] Cash payment flow completo
- [x] Stock se descuenta de stock_venta automáticamente
- [x] Ventas guardadas en BD correctamente
- [x] Refresh tokens persistentes sin interrupciones
- [x] Modal de pago responsive y optimizado
- [x] Sistema de logs para debugging

**✅ Sprint 3.2 Status: COMPLETED** (Backend 100% + Frontend 100%)

#### Sprint 3.3: Sales Processing - Part 2 (Week 9)
- [ ] Stripe payment integration
- [ ] Receipt generation (PDF)
- [ ] Stock updates on sale
- [ ] Sales history per store
- [ ] Basic returns functionality

**Deliverables:**
- [ ] Complete sales processing
- [ ] Payment gateway integration
- [ ] Receipt generation
- [ ] Automated stock updates

### Phase 4: Store Configuration & Polish (Weeks 10-11)
**Goal:** Store-specific settings and UI polish

#### Sprint 4.1: Store Configuration (Week 10)
- [ ] Store settings page
- [ ] Currency and tax configuration
- [ ] Store information (address, phone, etc.)
- [ ] Alert threshold configuration
- [ ] Store branding (logo, colors)

**Deliverables:**
- [ ] Complete store configuration
- [ ] Per-store settings
- [ ] Store branding options

#### Sprint 4.2: UI/UX Polish (Week 11)
- [ ] Responsive design improvements
- [ ] Loading states and animations
- [ ] Error handling and user feedback
- [ ] Dashboard with multi-store overview
- [ ] Help documentation

**Deliverables:**
- [ ] Polished, professional UI
- [ ] Excellent user experience
- [ ] Comprehensive error handling
- [ ] Multi-store dashboard

### Phase 5: Testing & Deployment (Weeks 12-13)
**Goal:** Comprehensive testing and production deployment

#### Sprint 5.1: Testing (Week 12)
- [ ] Unit tests for critical paths
- [ ] Integration tests
- [ ] E2E testing (multi-store flows)
- [ ] Performance testing
- [ ] Security audit

**Deliverables:**
- [ ] Test coverage > 70%
- [ ] All critical paths tested
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed

#### Sprint 5.2: Deployment (Week 13)
- [ ] Production environment setup
- [ ] CI/CD pipeline
- [ ] Database migrations
- [ ] Monitoring and logging
- [ ] Backup procedures

**Deliverables:**
- [ ] Application deployed to production
- [ ] Monitoring in place
- [ ] Backup system working
- [ ] Documentation complete

## Data Model Changes for Multi-Store

### Core Entities

#### Users
```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'owner' | 'employee';
  created_at: Date;
  updated_at: Date;
}
```

#### Stores
```typescript
interface Store {
  id: string;
  owner_id: string; // References User.id
  name: string;
  address?: string;
  phone?: string;
  currency: string;
  tax_rate: number;
  low_stock_threshold: number;
  created_at: Date;
  updated_at: Date;
}
```

#### UserStores (Many-to-Many Relationship)
```typescript
interface UserStore {
  id: string;
  user_id: string; // References User.id
  store_id: string; // References Store.id
  role: 'owner' | 'employee';
  created_at: Date;
}
```

### Key Relationships
- **User ↔ Stores**: Many-to-Many through UserStores
  - Owners can have multiple stores
  - Employees can work at multiple stores (future)
- **Store ↔ Products**: One-to-Many
  - Each product belongs to one store
- **Store ↔ Sales**: One-to-Many
  - Each sale belongs to one store
- **Store ↔ Invitations**: One-to-Many
  - Invitations are store-specific

## Current Sprint (Phase 1 Complete - Ready for Phase 2)

### Sprint 1.1, 1.2 & 1.3 - ✅ COMPLETADOS

#### Sprint 1.1 Tasks - ✅
1. **Project Initialization** ✅
   - [x] Initialize repository structure
   - [x] Set up TypeScript configuration
   - [x] Configure linting and formatting
   - [x] Set up testing framework

2. **Database Setup** ✅
   - [x] Design multi-store schema
   - [x] Create migration files
   - [x] Set up Supabase connection
   - [x] Create seed data

3. **Backend Foundation** ✅
   - [x] Express server setup
   - [x] Middleware configuration
   - [x] Error handling
   - [x] Security headers

4. **Frontend Foundation** ✅
   - [x] Next.js/React setup
   - [x] Tailwind CSS configuration
   - [x] Routing setup
   - [x] Basic layout components

#### Sprint 1.2 Tasks - ✅
1. **Authentication System** ✅
   - [x] User registration with first store
   - [x] Login with stores array
   - [x] JWT token generation and validation
   - [x] Password hashing with bcrypt
   - [x] Token refresh mechanism

2. **Store Management Backend** ✅
   - [x] Store CRUD operations
   - [x] Store access validation
   - [x] Multi-store support
   - [x] Store statistics
   - [x] User-store relationships

#### Sprint 1.3 Tasks - ✅
1. **Frontend Authentication** ✅
   - [x] AuthContext implementation
   - [x] Login page
   - [x] Register page
   - [x] Protected routes

2. **Frontend Store Management** ✅
   - [x] StoreContext implementation
   - [x] Store selector component
   - [x] Store list page
   - [x] Store management UI
   - [x] Dashboard with stats

### Active Tasks (Ready for Sprint 2.1)
Phase 1 complete. Ready to start Phase 2: Inventory & User Management

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Store context management complexity | High | Medium | Solid state management, thorough testing |
| Data isolation between stores | High | Low | Database-level constraints, middleware checks |
| Payment integration complexity | High | Medium | Early integration testing, Stripe documentation |
| Scanner compatibility issues | Medium | High | Multiple libraries, fallback manual entry |
| Multi-store UI complexity | Medium | Medium | Clear store indicators, easy switching |
| Performance with multiple stores | Medium | Low | Proper indexing, query optimization |

## Technical Decisions

### Frontend Stack
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State Management:** React Context + custom hooks
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Fetch API with custom wrapper

### Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT with httpOnly cookies
- **Validation:** Zod or Joi
- **Testing:** Jest + Supertest

### DevOps
- **Hosting:** Vercel (Frontend) + Railway/Render (Backend)
- **Database:** Supabase
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry for error tracking

## Multi-Store User Flows

### Owner Flow - Creating Second Store
1. Owner logs in → Dashboard shows all stores
2. Click "Add New Store" → Fill store details
3. Store created → Can switch between stores
4. Each store has independent inventory/sales
5. Owner can invite different employees to each store

### Owner Flow - Managing Multiple Stores
1. Dashboard shows overview of all stores
2. Store selector in header/sidebar
3. Click store name → Switch context
4. All data (products, sales, users) filtered by current store
5. Visual indicator of current store always visible

### Employee Flow - Single Store
1. Employee logs in → Redirected to assigned store
2. No store selector (only has access to one store)
3. Can only view/edit data for assigned store
4. Dashboard shows only assigned store data

## Progress Tracking

### Completed Tasks
- [x] Project documentation with multi-store architecture (Sprint 1.1)
- [x] Database schema design and migrations (Sprint 1.1)
- [x] Backend models for User, Store, UserStore (Sprint 1.1)
- [x] Authentication system with multi-store support (Sprint 1.2)
- [x] Store management API (Sprint 1.2)
- [x] JWT authentication middleware (Sprint 1.2)
- [x] Store access validation middleware (Sprint 1.2)
- [x] Password security with bcrypt (Sprint 1.2)
- [x] User registration with first store creation (Sprint 1.2)
- [x] Login with stores array (Sprint 1.2)
- [x] CRUD endpoints for stores (Sprint 1.2)
- [x] Frontend AuthContext with hooks (Sprint 1.3)
- [x] Frontend StoreContext with hooks (Sprint 1.3)
- [x] Login and Register pages (Sprint 1.3)
- [x] Protected routes component (Sprint 1.3)
- [x] Store selector component (Sprint 1.3)
- [x] Dashboard page with stats (Sprint 1.3)
- [x] Stores management page (Sprint 1.3)
- [x] Complete API client (Sprint 1.3)
- [x] TypeScript types for all entities (Sprint 1.3)

### In Progress
- [ ] Phase 2: Inventory & User Management (Sprint 2.1) 🚧 NEXT

### Blocked
- None currently

## Next Actions
1. ✅ Complete architecture documentation (Sprint 1.1)
2. ✅ Set up development environment (Sprint 1.1)
3. ✅ Create database schema and migrations (Sprint 1.1)
4. ✅ Implement authentication system with multi-store support (Sprint 1.2)
5. ✅ Implement store creation and management (Sprint 1.2)
6. ✅ Implement frontend authentication and store management (Sprint 1.3)
7. ⏭️ **NEXT: Sprint 2.1 - Invitation System**
   - Backend invitation API
   - Email integration
   - Frontend invitation UI
   - Employee management per store

---

**Last Updated:** October 9, 2025  
**Next Review:** Weekly  
**Status:** Phase 1 ✅ COMPLETE (100%) - Ready for Phase 2  
**Architecture:** Multi-Store from the start  
**Current Sprint:** Ready for Sprint 2.1 - Invitation System  
**Backend Status:** ✅ COMPLETE (Auth + Store Management + Database)  
**Frontend Status:** ✅ COMPLETE (Auth + Store Management + UI)  
**Phase 1:** ✅ COMPLETE - Foundation established successfully
