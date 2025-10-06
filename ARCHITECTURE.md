# Flowence - System Architecture

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Data Flow](#data-flow)
4. [Security Architecture](#security-architecture)
5. [Scalability Considerations](#scalability-considerations)
6. [Technology Decisions](#technology-decisions)
7. [Database Design](#database-design)
8. [API Design](#api-design)
9. [Frontend Architecture](#frontend-architecture)
10. [Deployment Architecture](#deployment-architecture)

## Architecture Overview

Flowence follows a modern, scalable architecture pattern with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React PWA)   │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   External      │    │   Backup        │
│   Assets        │    │   Services      │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Principles
- **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
- **Stateless Backend**: JWT-based authentication for scalability
- **Progressive Web App**: Offline capabilities and mobile-first design
- **Microservices Ready**: Modular design for future service extraction
- **Security First**: Authentication, authorization, and data protection at every layer

## System Components

### Frontend Layer (React PWA)
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── inventory/       # Inventory management
│   ├── sales/           # Sales processing
│   └── common/          # Shared components
├── pages/               # Route-based page components
├── hooks/               # Custom React hooks
├── services/            # API communication layer
├── store/               # State management (Context/Redux)
├── utils/               # Utility functions
└── types/               # TypeScript definitions
```

**Key Features:**
- Responsive design with Tailwind CSS
- Barcode scanning with QuaggaJS
- Offline capability with service workers
- Real-time updates via WebSocket (future)
- Progressive Web App features

### Backend Layer (Node.js/Express)
```
server/
├── controllers/         # Request handlers
├── middleware/          # Express middleware
├── models/              # Database models
├── routes/              # API route definitions
├── services/            # Business logic layer
├── utils/               # Server utilities
└── config/              # Configuration files
```

**Key Features:**
- RESTful API design
- JWT-based authentication
- Input validation and sanitization
- Error handling and logging
- Rate limiting and security middleware

### Database Layer (PostgreSQL)
```
Database Schema:
├── users                # User accounts and authentication
├── stores               # Store information and settings
├── products             # Product catalog and inventory
├── sales                # Sales transactions
├── sale_items           # Individual sale line items
├── invitations          # User invitation system
└── audit_logs           # System audit trail
```

**Key Features:**
- ACID compliance for data integrity
- Proper indexing for performance
- Foreign key constraints for data consistency
- Audit logging for compliance
- Backup and recovery procedures

## Data Flow

### Authentication Flow
```
1. User Login Request
   ↓
2. Frontend → Backend (POST /api/auth/login)
   ↓
3. Backend validates credentials
   ↓
4. Generate JWT token
   ↓
5. Return token + user info
   ↓
6. Frontend stores token
   ↓
7. Subsequent requests include Authorization header
```

### Sales Processing Flow
```
1. Scanner/Manual Product Entry
   ↓
2. Frontend validates product exists
   ↓
3. Add to shopping cart (local state)
   ↓
4. User confirms sale
   ↓
5. Frontend → Backend (POST /api/sales)
   ↓
6. Backend validates stock availability
   ↓
7. Process payment (Stripe integration)
   ↓
8. Create sale record + update inventory
   ↓
9. Generate receipt
   ↓
10. Return success + receipt data
```

### Inventory Management Flow
```
1. Owner adds/edits product
   ↓
2. Frontend → Backend (POST/PUT /api/products)
   ↓
3. Backend validates data
   ↓
4. Update database
   ↓
5. Return updated product data
   ↓
6. Frontend refreshes inventory view
   ↓
7. Broadcast update to connected clients (future)
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   - JWT Storage │◄──►│   - JWT Verify  │◄──►│   - User Roles  │
│   - Route Guard │    │   - Role Check  │    │   - Permissions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Security Measures:**
- JWT tokens with expiration (30 minutes)
- Password hashing with bcrypt
- HTTPS enforcement
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Audit logging

### Data Protection
- Sensitive data encryption at rest
- Secure password storage (bcrypt)
- PCI compliance for payment data
- GDPR compliance considerations
- Regular security audits
- Backup encryption

## Scalability Considerations

### Horizontal Scaling
```
Load Balancer
     ↓
┌─────────┬─────────┬─────────┐
│Server 1 │Server 2 │Server 3 │
│(Node.js)│(Node.js)│(Node.js)│
└─────────┴─────────┴─────────┘
     ↓         ↓         ↓
┌─────────────────────────────┐
│     Shared Database         │
│     (PostgreSQL)            │
└─────────────────────────────┘
```

**Scaling Strategies:**
- Stateless backend design
- Database connection pooling
- CDN for static assets
- Redis for session storage (future)
- Microservices extraction (future)
- Container orchestration (Docker/Kubernetes)

### Performance Optimization
- Database indexing strategy
- Query optimization
- Caching mechanisms
- Image optimization
- Code splitting (frontend)
- Lazy loading
- Service worker caching

## Technology Decisions

### Frontend Stack
| Technology | Purpose | Justification |
|------------|---------|---------------|
| React 18+ | UI Framework | Component-based, large ecosystem |
| TypeScript | Type Safety | Reduced bugs, better developer experience |
| Tailwind CSS | Styling | Utility-first, responsive design |
| React Router | Navigation | Standard routing solution |
| QuaggaJS | Barcode Scanning | Cross-platform, web-based |
| Axios | HTTP Client | Promise-based, interceptors |

### Backend Stack
| Technology | Purpose | Justification |
|------------|---------|---------------|
| Node.js | Runtime | JavaScript ecosystem, fast development |
| Express | Web Framework | Minimal, flexible, well-documented |
| Passport.js | Authentication | Multiple strategies, JWT support |
| PostgreSQL | Database | ACID compliance, relational data |
| Stripe | Payments | Reliable, secure, well-documented |
| SendGrid | Email | Reliable delivery, good API |

### DevOps Stack
| Technology | Purpose | Justification |
|------------|---------|---------------|
| Docker | Containerization | Consistent environments |
| Nginx | Reverse Proxy | High performance, SSL termination |
| PM2 | Process Management | Production-ready Node.js management |
| Jest | Testing | Comprehensive testing framework |
| ESLint | Code Quality | Consistent code style |

## Database Design

### Entity Relationship Diagram
```
Users ──┬── Stores
        │
        └── Sales ── Sale_Items ── Products
                          │
                          └── Products ── Stores
```

### Key Relationships
- **Users ↔ Stores**: Many-to-One (employees belong to one store)
- **Stores ↔ Products**: One-to-Many (store has many products)
- **Sales ↔ Sale_Items**: One-to-Many (sale has multiple items)
- **Products ↔ Sale_Items**: One-to-Many (product can be in multiple sales)

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_sales_store_id ON sales(store_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
```

### Data Consistency
- Foreign key constraints
- Check constraints for data validation
- Triggers for audit logging
- Transactions for multi-table operations
- Unique constraints for business rules

## API Design

### RESTful API Principles
- Resource-based URLs
- HTTP methods for operations
- Consistent response format
- Proper HTTP status codes
- Versioning strategy

### API Endpoints Structure
```
/api/v1/
├── auth/
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
├── users/
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── stores/
│   ├── GET /
│   ├── PUT /:id
│   └── POST /invite
├── products/
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
└── sales/
    ├── GET /
    ├── POST /
    └── GET /:id
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-10-01T12:00:00Z"
}
```

## Frontend Architecture

### Component Architecture
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Main
├── Pages
│   ├── Dashboard
│   ├── Inventory
│   ├── Sales
│   └── Settings
└── Common
    ├── Modal
    ├── Loading
    └── ErrorBoundary
```

### State Management
- React Context for global state
- Local state with useState/useReducer
- Custom hooks for business logic
- Service layer for API calls

### Routing Strategy
- Protected routes with authentication guards
- Role-based route access
- Lazy loading for performance
- Breadcrumb navigation

## Deployment Architecture

### Production Environment
```
Internet
    ↓
┌─────────────────┐
│   Load Balancer │
│   (Nginx)       │
└─────────────────┘
    ↓
┌─────────────────┐
│   Web Server    │
│   (Node.js)     │
└─────────────────┘
    ↓
┌─────────────────┐
│   Database      │
│   (PostgreSQL)  │
└─────────────────┘
```

### Infrastructure Components
- **Web Server**: Node.js with PM2
- **Reverse Proxy**: Nginx for SSL termination
- **Database**: PostgreSQL with connection pooling
- **File Storage**: Local filesystem or cloud storage
- **Monitoring**: Application and infrastructure monitoring
- **Backup**: Automated database backups

### CI/CD Pipeline
```
Code Commit
    ↓
GitHub Actions
    ↓
├── Lint & Test
├── Build
├── Docker Build
└── Deploy
```

### Environment Configuration
- **Development**: Local development with hot reloading
- **Staging**: Production-like environment for testing
- **Production**: Optimized, monitored, and secured

## Future Architecture Considerations

### Microservices Migration
- Extract authentication service
- Separate inventory management
- Independent sales processing
- Dedicated notification service

### Real-time Features
- WebSocket integration
- Live inventory updates
- Real-time notifications
- Collaborative editing

### Advanced Features
- Machine learning for inventory prediction
- Advanced analytics and reporting
- Multi-store management
- API for third-party integrations

---

**Last Updated:** [Current Date]  
**Version:** 1.0  
**Architect:** Development Team

