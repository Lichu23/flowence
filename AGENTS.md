# Flowence - AI Assistant Instructions

## Project Overview
Flowence is an all-in-one supermarket/warehouse management web application (PWA) designed for small to medium businesses. The system provides authentication, user management, inventory control, and sales processing with barcode scanning capabilities.

## Core Technologies
- **Frontend:** React 18+ with TypeScript, Tailwind CSS, Progressive Web App
- **Backend:** Node.js with Express, TypeScript
- **Database:** PostgreSQL (primary) or MongoDB
- **Authentication:** JWT with Passport.js
- **Payments:** Stripe integration
- **Scanner:** QuaggaJS for barcode scanning
- **Email:** SendGrid for invitations and notifications

## Code Style & Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Prefer `const` over `let`, avoid `var`
- Use proper generic types and utility types

```typescript
// Good example
interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  category?: string;
  description?: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bad example
const product = {
  id: "123",
  name: "Product"
  // Missing required fields and types
};
```

### React Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow single responsibility principle
- Use custom hooks for business logic

```typescript
// Good example
const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  onEdit, 
  onDelete 
}) => {
  const handleEdit = useCallback(() => {
    onEdit(product.id);
  }, [product.id, onEdit]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
      <div className="mt-2 space-x-2">
        <button 
          onClick={handleEdit}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(product.id)}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

// Bad example
const ProductCard = ({ product, onEdit }) => {
  return <div>...</div>; // No TypeScript, no memoization, no proper styling
};
```

### API Design Guidelines
- Use RESTful API design principles
- Implement proper HTTP status codes
- Use consistent error response format
- Validate all input data
- Use proper authentication middleware

```typescript
// Good example
export const createProduct = async (
  productData: CreateProductRequest
): Promise<ApiResponse<Product>> => {
  try {
    const response = await api.post<Product>('/products', productData);
    return {
      success: true,
      data: response.data,
      message: 'Product created successfully'
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ValidationError('Invalid product data', error.details);
    }
    throw new Error('Failed to create product');
  }
};

// Bad example
export const createProduct = async (data) => {
  const response = await fetch('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json(); // No error handling, no types
};
```

## Architecture Patterns

### Frontend Architecture
- **Component Structure:** Atomic design principles (atoms, molecules, organisms)
- **State Management:** React Context for global state, local state with hooks
- **Routing:** React Router with protected routes and role-based access
- **Styling:** Tailwind CSS with component-based design system

### Backend Architecture
- **Layered Architecture:** Controllers → Services → Models → Database
- **Middleware Pattern:** Authentication, validation, error handling
- **Repository Pattern:** Data access abstraction
- **Service Layer:** Business logic separation

### Database Design
- **Normalization:** Proper table relationships and constraints
- **Indexing:** Performance optimization for common queries
- **Migrations:** Version-controlled schema changes
- **Audit Trail:** Logging important operations

## Business Logic Rules

### User Management
- Owners can invite employees to their store
- Employees can only access their assigned store
- Role-based permissions: owners have full access, employees have limited access
- Invitations expire after 24 hours

### Inventory Management
- Products must have unique barcodes within a store
- Stock cannot go below zero
- Price must be greater than cost
- Low stock alerts when quantity < 5 (configurable)

### Sales Processing
- Sales automatically update inventory stock
- Stock validation before completing sale
- Support for cash and card payments
- Receipt generation for all sales
- Return functionality for recent sales

### Security Requirements
- JWT tokens expire after 30 minutes
- Password minimum 8 characters with complexity
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection and XSS prevention

## File Organization

### Frontend Structure
```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── inventory/      # Inventory management
│   ├── sales/          # Sales processing
│   ├── common/         # Shared components
│   └── ui/             # Base UI components
├── pages/              # Route-based pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # State management
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

### Backend Structure
```
server/
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Server utilities
├── config/             # Configuration
└── types/              # TypeScript definitions
```

## Development Workflow

### Git Workflow
- Feature branches from `main`
- Descriptive commit messages
- Pull request reviews required
- Automated testing on CI/CD

### Testing Requirements
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Component tests for React components

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## Common Patterns

### Error Handling
```typescript
// Frontend error handling
const handleError = (error: Error) => {
  console.error('Operation failed:', error);
  toast.error(error.message || 'An unexpected error occurred');
};

// Backend error handling
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details
      }
    });
  }
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred'
    }
  });
};
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Form Handling
```typescript
const useFormValidation = <T>(schema: yup.Schema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = useCallback(async (data: T) => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema]);
  
  return { errors, validate };
};
```

## Performance Guidelines

### Frontend Performance
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use service workers for caching
- Minimize bundle size with code splitting

### Backend Performance
- Implement database indexing
- Use connection pooling
- Cache frequently accessed data
- Optimize database queries
- Implement rate limiting

### Database Performance
- Create indexes for frequently queried columns
- Use proper data types
- Avoid N+1 query problems
- Use database transactions appropriately
- Monitor query performance

## Security Best Practices

### Authentication
- Store JWT tokens securely (httpOnly cookies recommended)
- Implement token refresh mechanism
- Use strong password policies
- Implement account lockout after failed attempts

### Data Validation
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries
- Implement CSRF protection

### Error Handling
- Don't expose sensitive information in error messages
- Log errors for debugging
- Implement proper error boundaries
- Use consistent error response format

## Accessibility Guidelines

### WCAG Compliance
- Provide alt text for images
- Ensure keyboard navigation
- Use proper heading hierarchy
- Implement focus management
- Provide sufficient color contrast

### Mobile Responsiveness
- Mobile-first design approach
- Touch-friendly interface elements
- Responsive layouts for all screen sizes
- Optimize for tablet use in stores

## Deployment Considerations

### Environment Configuration
- Use environment variables for configuration
- Separate development, staging, and production configs
- Implement proper logging
- Set up monitoring and alerting

### Database Migrations
- Version control all schema changes
- Test migrations on staging environment
- Implement rollback procedures
- Backup data before major changes

## AI Assistant Guidelines

When helping with this project:

1. **Always use TypeScript** - No JavaScript unless absolutely necessary
2. **Follow the established patterns** - Use the code examples provided
3. **Implement proper error handling** - Never leave try-catch blocks empty
4. **Write tests** - Include unit tests for new functionality
5. **Consider security** - Validate inputs and handle errors securely
6. **Follow accessibility guidelines** - Ensure components are accessible
7. **Optimize for performance** - Consider React.memo, lazy loading, etc.
8. **Use proper naming conventions** - Descriptive names for functions and variables
9. **Document complex logic** - Add comments for business rules
10. **Consider mobile usage** - Design for tablet/mobile use in retail environment

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

### Database
```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database
npm run db:reset
```

### Deployment
```bash
# Build Docker image
docker build -t flowence .

# Run Docker container
docker run -p 3000:3000 flowence

# Deploy to production
npm run deploy
```

---

**Remember:** This is a retail management system that will be used by business owners and employees. Prioritize usability, reliability, and security in all implementations.

