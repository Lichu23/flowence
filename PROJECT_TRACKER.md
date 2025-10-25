# Flowence - Project Tracker (Multi-Store Architecture)

## Project Overview
**Project Name:** Flowence - All-in-One Multi-Store Management App  
**Version:** 1.0 (MVP) - Multi-Store Edition  
**Start Date:** October 2025  
**Target Completion:** [To be defined]  
**Status:** Phase 5 - Testing & Deployment ⚡ IN PROGRESS (Sprint 5.1 - 50%)  

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

### Phase 2: Inventory & User Management (Weeks 4-6) ✅ COMPLETADO (100%)
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
- [x] Receipt generation (PDF)
- [x] Stock updates on sale
- [x] Sales history per store
- [x] Basic returns functionality


**Deliverables:**
- [x] Complete sales processing
- [x] Payment gateway integration
- [x] Receipt generation
- [x] Automated stock updates

### Phase 4: Store Configuration & Polish (Weeks 10-11)
**Goal:** Store-specific settings and UI polish

#### Sprint 4.1: Store Configuration (Week 10)
- [x] Store settings page
- [x] Currency and tax configuration
- [x] Store information (address, phone, etc.)
- [x] Alert threshold configuration
- [x] Store branding (logo)

**Deliverables:**
- [x] Complete store configuration
- [x] Per-store settings
- [x] Store branding options

#### Sprint 4.2: UI/UX Polish (Week 11) ✅ COMPLETADO
- [x] Reusable UI components (Loading, Error, Empty, Toast, Card, Tooltip)
- [x] Loading states and animations
- [x] Custom CSS animations (slide-in, fade-in, scale-in)
- [x] Dashboard with multi-store overview
- [x] Help documentation system (context-sensitive)
- [x] Toast notification system (replaces alerts)
- [x] Apply new components to all pages
- [x] Migrate all alert() calls to toast notifications
- [x] HelpButton added to all pages
- [x] Error handling migration to new components

**Deliverables:**
- [x] Reusable UI component library
- [x] Multi-store dashboard overview
- [x] Context-sensitive help system
- [x] Toast notification system
- [x] Smooth animations and transitions
- [x] Consistent UI across all pages
- [x] Comprehensive error handling with toast notifications

### Phase 5: Testing & Deployment (Weeks 12-13)
**Goal:** Comprehensive testing and production deployment

#### Sprint 5.1: Testing (Week 12) ⚡ EN PROGRESO (50%)
- [x] Testing infrastructure setup (Jest + Playwright)
- [x] Test utilities and helpers
- [x] Unit tests for UI components (43 tests)
- [x] E2E tests for critical flows (35 tests)
- [x] Testing documentation (TESTING.md)
- [ ] Install dependencies and verify tests
- [ ] Additional unit tests (contexts, hooks, API)
- [ ] Performance testing
- [ ] Security audit
- [ ] Achieve 70%+ test coverage

**Deliverables:**
- [x] Testing infrastructure complete
- [x] 78 tests written (unit + E2E)
- [x] Test utilities and mocks
- [x] Comprehensive testing documentation
- [ ] Test coverage > 70% (pending execution)
- [ ] All critical paths tested (in progress)
- [ ] Performance benchmarks met (pending)
- [ ] Security vulnerabilities addressed (pending)

#### Sprint 5.2: Details, Metrics, and Global Dashboard ✅ COMPLETED
- [x] **Details Section**
- [x] Allow returns in two ways:
- [x] Return all.
- [x] Return by individual item (for *owner* and *employee*).
- [x] Remove the “Return” button in the *Sales* section and move it to *Details*.
- [x] Ensure all returns are managed solely from *Details*.
- [x] Hide current stock in *Details* (already managed internally; not visible to employees or owners).

- [x] **Dashboard**
- [x] Add a new section with a *card* showing the **total number of defective products**.
- [x] Make the card interactive to access a view/list of specific defective items.

- [x] **Per-store metrics**
- [x] Modify the “Inventory Value” → **“Expenses [Month]” card (show the month name next to the title).
- [x] Calculate the value as the **sum of all products purchased during that month** (monthly expenses).
- [x] Maintain **revenue** and **total sales** metrics, ensuring they are **separated by month**.

- [x] **Global summary metrics**
- Display only:
- [x] Display the **total number of employees** (adding all stores).
- [x] Calculate **total profit**:
- [x] [Total profit = Total revenue − Total expenses]
- [x] Make the **“Total profit”** card interactive:
- [x] When clicked, show individual cards per store.
- [x] Each card must include:
- [x] Store name
- [x] Month and year
- [x] Total expenses for the month
- [x] Total revenue for the month

**Deliverables:**
- [x] Centralized returns system in *Details*
- [x] Internal stock masking
- [x] Interactive card for defective products
- [x] Separate expense, revenue, and sales metrics by month
- [x] Global summary with total profit and monthly breakdown by store

#### Sprint Fix: Enhancements to the Sales and Product Management System ✅ COMPLETED (100%)
- [x] Adjust employee management
  - [x] Modify calculation to exclude owner from total employee count
  - [x] Verify correct implementation of logic
- [x] Correct total expenses calculation
  - [x] Ensure monthly expenses unaffected by purchases (reflected as expense, not deducted)
  - [x] Verify total expenses remain unchanged with returns
- [x] Implement profit discount for product returns
  - [x] Add logic to deduct profits for full or partial returns
  - [x] Ensure profits reflect loss from returned products
  - [x] Validate profit calculation after returns
- [x] Manage defective products
  - [x] Display monetary value of losses from defective products
  - [x] Include amount for each defective product in list
  - [x] Verify correct display in report
- [x] Implement currency format for total payment
  - [x] Apply currency format for card payments based on store configuration
  - [x] Validate correct display in selected currency
- [x] Update sales status
  - [x] Change status to "Refund" for full returns instead of "Completed"
  - [x] Verify correct status update based on return
- [x] Display returned products in sale details
  - [x] Include quantity, name, return date, and type ("customer error" or "defective")
  - [x] Ensure clear and separate display from non-returned products

**Deliverables:**
- [x] Logic excluding owner from employee count
- [x] Corrected monthly total expenses calculation
- [x] Profit deduction for returns implemented
- [x] Loss information for defective products added
- [x] Total card payment with correct currency format
- [x] Sales status updated to "Refund" for full returns
- [x] Sale details with returned products correctly recorded

#### **Sprint 5.3: Ticket System** ✅ COMPLETADO

* [x] Agregar código de barras al ticket de venta para identificar la compra mediante su ID
* [x] Implementar escaneo del código del ticket de pago para recuperar detalles de la venta
* [x] Agregar input para filtrar ventas por número o código de ticket
* [x] Implementar envío real de invitaciones por email con URL única de acceso para empleados

**Deliverables:**

* [x] Tickets de venta con código de barras funcional
* [x] Escaneo y filtrado de tickets operativo
* [x] Sistema de invitación por correo activo
* [x] Documentación actualizada

#### Sprint 5.4: Deployment
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

Perfecto, aquí tienes tu texto adaptado al formato solicitado:

---




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

## Current Sprint (Phase 3 - Sprint 3.3 Pending)

### Sprint 1.1, 1.2 & 1.3 - ✅ COMPLETADOS
### Sprint 2.1, 2.2 & 2.3 - ✅ COMPLETADOS
### Sprint 3.1 & 3.2 - ✅ COMPLETADOS

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
- [ ] Phase 3: Sprint 3.3 - Sales Processing Part 2 🚧

### Blocked
- None currently

## Next Actions
1. ⏭️ Begin Phase 5: Testing & Deployment
2. ⏭️ Unit tests for critical paths
3. ⏭️ Integration tests for API endpoints
4. ⏭️ E2E testing for multi-store flows
5. ⏭️ Performance testing and optimization
6. ⏭️ Security audit
7. ⏭️ Production deployment setup

---

**Last Updated:** October 20, 2025  
**Next Review:** Weekly  
**Status:** Phase 5 ⚡ IN PROGRESS - Testing & Deployment (Sprint 5.1 - 50%)  
**Architecture:** Multi-Store from the start  
**Current Sprint:** Sprint 5.1 - Testing Infrastructure  
**Backend Status:** ✅ Complete through Phase 4 (Auth, Multi-Store, Dual Stock, Sales, Config)  
**Frontend Status:** ✅ Complete through Phase 4 (All features + UI/UX Polish)  
**Testing Status:** ⚡ Infrastructure complete, 78 tests written, pending execution  
**Phase 1:** ✅ COMPLETE - Foundation established  
**Phase 2:** ✅ COMPLETE - Inventory & User Management  
**Phase 3:** ✅ COMPLETE - Sales & Scanner Integration  
**Phase 4:** ✅ COMPLETE - Store Configuration & Polish  
**Phase 5:** ⚡ IN PROGRESS - Testing & Deployment (Sprint 5.1 50%)
