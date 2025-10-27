# Flowence - Developer Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Environment Setup](#development-environment-setup)
4. [Technology Stack](#technology-stack)
5. [Coding Standards](#coding-standards)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Testing Guidelines](#testing-guidelines)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- MongoDB or PostgreSQL
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Code editor (VS Code recommended)

### Quick Start
```bash
# Clone the repository
git clone [repository-url]
cd flowence

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Project Structure

```
flowence/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── inventory/      # Inventory management components
│   │   ├── sales/          # Sales components
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── server/                 # Backend code
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Server utilities
├── docs/                   # Documentation
├── tests/                  # Test files
└── public/                 # Static assets
```

## Development Environment Setup

### 1. Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flowence
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30m

# Email Service
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@flowence.com

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:3001
```

### 2. Database Setup

#### PostgreSQL Setup
```bash
# Install PostgreSQL
# Create database
createdb flowence

# Run migrations
npm run migrate
```

#### MongoDB Setup
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Connect to MongoDB
mongo
use flowence
```

### 3. Development Scripts
```bash
# Start development server
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form handling
- **QuaggaJS** for barcode scanning
- **React PDF** for receipt generation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Passport.js** for authentication
- **JWT** for token management
- **Mongoose/Sequelize** for database ORM
- **Stripe** for payment processing
- **SendGrid** for email services

### Database
- **PostgreSQL** (recommended) or **MongoDB**
- **Redis** for session storage (optional)

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for unit testing
- **Cypress** for E2E testing
- **Docker** for containerization

## Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Prefer `const` over `let`, avoid `var`

```typescript
// Good
interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
}

// Bad
const product = {
  id: "123",
  name: "Product Name"
  // Missing required fields
};
```

### React Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow the single responsibility principle

```typescript
// Good
const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onEdit }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onEdit(product.id)}>Edit</button>
    </div>
  );
});

// Bad
const ProductCard = ({ product, onEdit }) => {
  // Missing TypeScript types
  // No memoization for performance
  return <div>...</div>;
};
```

### API Guidelines
- Use RESTful API design
- Implement proper HTTP status codes
- Use consistent error response format
- Validate all input data

```typescript
// Good
export const createProduct = async (productData: CreateProductRequest): Promise<Product> => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create product');
  }
};

// Bad
export const createProduct = async (data) => {
  const response = await fetch('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json(); // No error handling
};
```

### Database Guidelines
- Use migrations for schema changes
- Implement proper indexing
- Use transactions for multi-table operations
- Validate data at both application and database level

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new owner account.

**Request Body:**
```json
{
  "email": "owner@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "storeName": "My Supermarket"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "owner@example.com",
    "name": "John Doe",
    "role": "owner"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner",
    "storeId": "store_id"
  }
}
```

### Product Endpoints

#### GET /api/products
Get all products for the store.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "barcode": "123456789",
      "price": 10.99,
      "cost": 8.50,
      "stock": 100,
      "category": "Food",
      "description": "Product description"
    }
  ]
}
```

#### POST /api/products
Create a new product.

**Request Body:**
```json
{
  "name": "New Product",
  "barcode": "987654321",
  "price": 15.99,
  "cost": 12.00,
  "stock": 50,
  "category": "Electronics"
}
```

### Sales Endpoints

#### POST /api/sales
Process a new sale.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 10.99
    }
  ],
  "paymentMethod": "cash",
  "amountReceived": 25.00
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'employee')),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Stores Table
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(255) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sale Items Table
```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);
```

## Testing Guidelines

### Unit Testing
```typescript
// Example unit test
describe('ProductService', () => {
  it('should create a new product', async () => {
    const productData = {
      name: 'Test Product',
      barcode: '123456789',
      price: 10.99,
      cost: 8.50,
      stock: 100
    };

    const product = await ProductService.createProduct(productData);
    
    expect(product).toBeDefined();
    expect(product.name).toBe(productData.name);
    expect(product.barcode).toBe(productData.barcode);
  });
});
```

### Integration Testing
```typescript
// Example integration test
describe('Product API', () => {
  it('should create product via API', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        barcode: '123456789',
        price: 10.99,
        cost: 8.50,
        stock: 100
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### E2E Testing
```typescript
// Example E2E test
describe('Sales Flow', () => {
  it('should complete a sale from scanning to receipt', () => {
    cy.visit('/sales');
    cy.get('[data-testid="scanner-button"]').click();
    cy.get('[data-testid="product-list"]').should('contain', 'Product Name');
    cy.get('[data-testid="checkout-button"]').click();
    cy.get('[data-testid="payment-method"]').select('cash');
    cy.get('[data-testid="amount-received"]').type('25.00');
    cy.get('[data-testid="confirm-sale"]').click();
    cy.get('[data-testid="receipt"]').should('be.visible');
  });
});
```

## Deployment

### Production Environment Setup
1. Set up production database
2. Configure environment variables
3. Set up SSL certificates
4. Configure reverse proxy (Nginx)
5. Set up monitoring and logging

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment-specific Configuration
- **Development:** Hot reloading, debug mode, local database
- **Staging:** Production-like environment for testing
- **Production:** Optimized build, production database, monitoring

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connection
npm run db:test

# Reset database
npm run db:reset

# Check database logs
tail -f /var/log/postgresql/postgresql.log
```

#### Authentication Issues
- Verify JWT secret configuration
- Check token expiration settings
- Ensure proper CORS configuration

#### Scanner Issues
- Check camera permissions
- Verify HTTPS connection (required for camera access)
- Test with different barcode formats

#### Payment Integration Issues
- Verify Stripe API keys
- Check webhook endpoints
- Test with Stripe test cards

### Debug Mode
```bash
# Enable debug logging
DEBUG=flowence:* npm run dev

# Check specific module
DEBUG=flowence:auth npm run dev
```

### Performance Issues
- Use React DevTools Profiler
- Monitor database query performance
- Check network requests in browser DevTools
- Use Lighthouse for performance auditing

## Contributing

### Git Workflow
1. Create feature branch from `main`
2. Make changes with proper commit messages
3. Write tests for new functionality
4. Submit pull request with description
5. Code review and merge

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add password reset functionality`
- `fix(sales): resolve barcode scanning issue`
- `docs(api): update authentication endpoints`

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

---

**Last Updated:** [Current Date]  
**Version:** 1.0  
**Maintainer:** Development Team

