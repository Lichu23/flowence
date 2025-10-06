# 🚀 Flowence con Supabase - Guía de Configuración

## 📋 **¿Qué es Supabase?**

Supabase es una alternativa open-source a Firebase que proporciona:
- ✅ **PostgreSQL** como base de datos
- ✅ **Autenticación** integrada
- ✅ **Almacenamiento** de archivos
- ✅ **Tiempo real** con WebSockets
- ✅ **Edge Functions** para lógica del servidor
- ✅ **Dashboard** web para administración

## 🎯 **Ventajas de usar Supabase para Flowence:**

1. **Sin configuración de base de datos local**
2. **Autenticación lista para usar**
3. **Almacenamiento de archivos integrado**
4. **Tiempo real para actualizaciones de inventario**
5. **Dashboard web para administración**
6. **Escalabilidad automática**

## 🔧 **Configuración Paso a Paso**

### **Paso 1: Crear Proyecto en Supabase**

1. **Ir a [supabase.com](https://supabase.com)**
2. **Crear cuenta** (gratis)
3. **Crear nuevo proyecto:**
   - **Name:** `flowence`
   - **Database Password:** `generar contraseña segura`
   - **Region:** `us-east-1` (o la más cercana)
4. **Esperar** a que se complete la configuración (2-3 minutos)

### **Paso 2: Obtener Credenciales**

En el dashboard de Supabase:

1. **Ir a Settings → API**
2. **Copiar las siguientes credenciales:**
   - **Project URL:** `https://your-project-id.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Paso 3: Configurar Variables de Entorno**

#### **Servidor (server/.env):**

```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_REGION=us-east-1

# Direct Database Connection (for migrations)
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres

# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# JWT Configuration (Custom Auth - Optional)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d

# Supabase Auth Configuration
USE_SUPABASE_AUTH=true

# Email Configuration
USE_SUPABASE_EMAIL=true
ENABLE_EMAIL_INVITES=true

# Payment Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
ENABLE_STRIPE_PAYMENTS=true

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Feature Flags
ENABLE_EMAIL_INVITES=true
ENABLE_STRIPE_PAYMENTS=true
ENABLE_BARCODE_SCANNER=true
ENABLE_PWA=true

# Supabase Features
USE_SUPABASE_AUTH=true
USE_SUPABASE_STORAGE=true
USE_SUPABASE_REALTIME=true
USE_SUPABASE_EDGE_FUNCTIONS=true
```

#### **Cliente (client/.env):**

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Application Configuration
REACT_APP_APP_NAME=Flowence
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_EMAIL_INVITES=true
REACT_APP_ENABLE_STRIPE_PAYMENTS=true
REACT_APP_ENABLE_BARCODE_SCANNER=true
REACT_APP_ENABLE_PWA=true

# Supabase Features
REACT_APP_USE_SUPABASE_AUTH=true
REACT_APP_USE_SUPABASE_STORAGE=true
REACT_APP_USE_SUPABASE_REALTIME=true
```

### **Paso 4: Crear Esquema de Base de Datos**

En el dashboard de Supabase:

1. **Ir a SQL Editor**
2. **Ejecutar el siguiente SQL:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'employee')),
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    tax_rate DECIMAL(5,4) DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    owner_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(255),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    cost DECIMAL(10,2) NOT NULL CHECK (cost > 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100),
    description TEXT,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_price_greater_than_cost CHECK (price > cost),
    CONSTRAINT unique_barcode_per_store UNIQUE (barcode, store_id)
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card')),
    amount_received DECIMAL(10,2) NOT NULL CHECK (amount_received >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee')),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_sales_store_id ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_store_id ON invitations(store_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_is_active ON invitations(is_active);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at 
    BEFORE UPDATE ON invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### **Paso 5: Configurar Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Store owners can see all users in their stores
CREATE POLICY "Store owners can view store users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = users.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

-- Similar policies for other tables...
```

### **Paso 6: Instalar Dependencias**

#### **Servidor:**
```bash
cd server
npm install
```

#### **Cliente:**
```bash
cd client
npm install
```

### **Paso 7: Inicializar Supabase**

```bash
cd server
npm run supabase:init
```

### **Paso 8: Ejecutar el Proyecto**

#### **Servidor:**
```bash
cd server
npm run dev
```

#### **Cliente:**
```bash
cd client
npm start
```

## 🎯 **Características de Supabase para Flowence**

### **✅ Autenticación Integrada:**
- Registro de usuarios
- Login/logout
- Recuperación de contraseñas
- Verificación de email
- Roles y permisos

### **✅ Base de Datos PostgreSQL:**
- Esquema completo
- Índices optimizados
- Row Level Security
- Triggers automáticos

### **✅ Almacenamiento de Archivos:**
- Subida de imágenes de productos
- Documentos de ventas
- Backups automáticos

### **✅ Tiempo Real:**
- Actualizaciones de inventario en tiempo real
- Notificaciones de ventas
- Colaboración en tiempo real

### **✅ Dashboard Web:**
- Administración de usuarios
- Monitoreo de base de datos
- Logs de autenticación
- Métricas de uso

## 🔧 **Comandos Útiles**

```bash
# Inicializar Supabase
npm run supabase:init

# Sembrar base de datos
npm run supabase:seed

# Verificar conexión
npm run dev
```

## 📊 **Ventajas vs PostgreSQL Local**

| Característica | PostgreSQL Local | Supabase |
|----------------|------------------|----------|
| **Configuración** | Compleja | Simple |
| **Autenticación** | Manual | Integrada |
| **Almacenamiento** | Manual | Integrado |
| **Tiempo Real** | No | Sí |
| **Dashboard** | No | Sí |
| **Escalabilidad** | Manual | Automática |
| **Backups** | Manual | Automáticos |
| **Costo** | Gratis | Gratis hasta 500MB |

## 🚀 **Próximos Pasos**

1. **Configurar Supabase** siguiendo esta guía
2. **Probar autenticación** en el frontend
3. **Implementar CRUD** de productos
4. **Agregar tiempo real** para inventario
5. **Configurar almacenamiento** para imágenes

¿Necesitas ayuda con algún paso específico de la configuración de Supabase?
