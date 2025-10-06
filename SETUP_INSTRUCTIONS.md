# Flowence - Setup Instructions

## 🎉 Phase 1 Complete!

La **Fase 1: Foundation & Setup** ha sido completada exitosamente. Aquí está todo lo que se ha implementado:

## ✅ What's Been Completed

### Backend (Server)
- ✅ **Express.js server** con TypeScript
- ✅ **Sistema de autenticación completo** (JWT, login/register, password management)
- ✅ **Modelos de base de datos** (User, Store, Product, Sale, Invitation)
- ✅ **Sistema de migraciones** de base de datos
- ✅ **Middleware de seguridad** (rate limiting, CORS, helmet)
- ✅ **Validación de datos** con express-validator
- ✅ **Manejo de errores** centralizado
- ✅ **Configuración de entorno** completa

### Frontend (Client)
- ✅ **React 18** con TypeScript
- ✅ **React Router** para navegación
- ✅ **Tailwind CSS** para estilos
- ✅ **React Query** para manejo de estado del servidor
- ✅ **React Hook Form** para formularios
- ✅ **Sistema de autenticación** completo
- ✅ **Componentes básicos** (Layout, Sidebar, Header)
- ✅ **Páginas principales** (Login, Register, Dashboard, Products, Sales, Settings)

### Database
- ✅ **Esquema completo** con todas las tablas
- ✅ **Migraciones automáticas**
- ✅ **Índices optimizados**
- ✅ **Constraints de integridad**
- ✅ **Triggers para timestamps**

## 🚀 How to Run the Project

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=flowence_dev
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Initialize database:**
   ```bash
   npm run db:init
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

   The client will run on `http://localhost:3000`

## 📁 Project Structure

```
flowence/
├── server/                 # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── database/      # Database connection & migrations
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── client/                # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   └── package.json
└── PROJECT_TRACKER.md     # Project progress tracking
```

## 🔧 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run db:init` - Initialize database
- `npm run db:migrate` - Run migrations
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🗄️ Database Schema

The database includes the following tables:

- **users** - User accounts (owners and employees)
- **stores** - Store information
- **products** - Product inventory
- **sales** - Sales transactions
- **sale_items** - Individual items in sales
- **invitations** - Employee invitations

## 🔐 Authentication

The system includes:
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (owner/employee)
- Token refresh mechanism
- Password strength validation

## 🎨 Frontend Features

- Responsive design with Tailwind CSS
- Protected routes
- Form validation
- Toast notifications
- Loading states
- Error handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

## 🚦 Next Steps (Phase 2)

The next phase will include:
- User management and invitations
- Inventory management system
- Basic scanner integration
- Sales processing module
- Store configuration

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port already in use:**
   - Change ports in `.env` file
   - Kill existing processes on ports 3000/3001

3. **TypeScript errors:**
   - Run `npm run build` to check for type errors
   - Ensure all dependencies are installed

## 📝 Development Notes

- The project uses strict TypeScript configuration
- All API responses follow a consistent format
- Security best practices are implemented
- Code is formatted with Prettier
- ESLint is configured for code quality

## 🎯 Success Metrics

Phase 1 has achieved:
- ✅ Complete authentication system
- ✅ Full database schema
- ✅ Basic frontend structure
- ✅ Development environment ready
- ✅ Security measures implemented
- ✅ TypeScript throughout
- ✅ Modern React patterns

**Phase 1 is 100% complete and ready for Phase 2 development!**

