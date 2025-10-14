# Sprint 3.2: POS/Sales System - Part 1

**Fecha de Inicio:** 14 de Octubre, 2025  
**Estado:** 🚧 En Progreso  
**Prioridad:** Alta

---

## 🎯 Objetivo

Implementar el sistema de Punto de Venta (POS) como la **vista principal para empleados**, permitiendo:
- Escanear productos con el scanner integrado
- Acumular productos en un carrito temporal
- Modificar/editar productos en el carrito
- Calcular totales automáticamente
- Procesar pagos en efectivo

**Key Feature**: Los empleados acceden directamente al POS (NO al dashboard)

---

## 📋 Requisitos Funcionales

### RF1: Redirección por Rol
- ✅ **Owner** → Login → `/dashboard`
- ✅ **Employee** → Login → `/pos` (Punto de Venta)
- ✅ Navbar diferente para cada rol

### RF2: Interfaz POS para Empleados
- ✅ Vista principal: Grid de productos + Carrito
- ✅ Scanner integrado para agregar productos
- ✅ Búsqueda manual alternativa
- ✅ Carrito temporal en memoria/localStorage
- ✅ Edición de cantidades en el carrito
- ✅ Eliminación de items del carrito
- ✅ Cálculo automático de totales

### RF3: Gestión de Carrito
- ✅ Agregar producto (scanner o manual)
- ✅ Modificar cantidad
- ✅ Eliminar producto
- ✅ Limpiar carrito completo
- ✅ Validación de stock disponible
- ✅ Cálculo de subtotales por producto
- ✅ Cálculo de total general

### RF4: Procesamiento de Pago (Sprint 3.2)
- ✅ Pago en efectivo
- ✅ Registro de venta en base de datos
- ✅ Actualización de stock automática
- ✅ Generación de recibo simple
- ⏳ Pago con tarjeta (Sprint 3.3)

---

## 🏗️ Arquitectura

### Backend Structure

```
server/src/
├── types/
│   ├── cart.ts              # CartItem, Cart interfaces
│   └── sale.ts              # Sale, SaleItem interfaces
├── models/
│   ├── SaleModel.ts         # Database operations for sales
│   └── CartModel.ts         # (Optional) Cart validation
├── controllers/
│   └── SalesController.ts   # Cart & sales endpoints
├── routes/
│   └── sales.ts             # POS/Sales routes
└── services/
    └── SalesService.ts      # Business logic
```

### Frontend Structure

```
flowence-client/src/
├── app/
│   └── pos/
│       └── page.tsx         # Main POS page (employee view)
├── components/
│   ├── pos/
│   │   ├── ShoppingCart.tsx      # Cart sidebar
│   │   ├── ProductGrid.tsx       # Products display
│   │   ├── CartItem.tsx          # Individual cart item
│   │   └── CheckoutModal.tsx     # Payment processing
│   └── common/
│       └── ScannerButton.tsx     # Reused from Sprint 3.1
├── hooks/
│   └── useCart.ts           # Cart state management
└── contexts/
    └── CartContext.tsx      # (Optional) Global cart state
```

---

## 🔧 Implementación Detallada

### Fase 1: Backend - Tipos y Modelos

#### 1.1 Tipos TypeScript

**`server/src/types/cart.ts`**
```typescript
export interface CartItem {
  product_id: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock_available: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  item_count: number;
}
```

**`server/src/types/sale.ts`**
```typescript
export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id?: string;
  store_id: string;
  user_id: string;
  sale_date: Date;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card';
  payment_status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

export interface CreateSaleRequest {
  store_id: string;
  items: SaleItem[];
  payment_method: 'cash' | 'card';
  payment_received?: number;
  notes?: string;
}

export interface SaleResponse {
  sale_id: string;
  total: number;
  change?: number;
  receipt_url?: string;
}
```

#### 1.2 Endpoints del Backend

**POST /api/stores/:storeId/sales/cart/validate**
- Valida stock disponible para items del carrito
- Calcula totales (subtotal, tax, total)
- Retorna cart validado

**POST /api/stores/:storeId/sales**
- Procesa una venta completa
- Actualiza stock de productos
- Registra venta en base de datos
- Retorna sale_id y detalles

**GET /api/stores/:storeId/sales**
- Lista ventas de la tienda
- Filtros: fecha, empleado, método pago
- Paginación

**GET /api/stores/:storeId/sales/:saleId**
- Detalle de una venta específica
- Items de la venta
- Información de pago

---

### Fase 2: Frontend - Página POS

#### 2.1 Estructura de la Página

```tsx
// /pos/page.tsx - Layout Principal

┌─────────────────────────────────────────────┐
│  NAVBAR (Employee Version)                  │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   PRODUCT SEARCH     │   SHOPPING CART      │
│   & SCANNER          │                      │
│                      │   • Items            │
│   ┌──────────────┐   │   • Quantities       │
│   │ [Scanner]    │   │   • Subtotals        │
│   │ [Search Bar] │   │                      │
│   └──────────────┘   │   ──────────────     │
│                      │   Subtotal: $XX.XX   │
│   PRODUCT GRID       │   Tax (16%): $X.XX   │
│   ┌────┬────┬────┐   │   ──────────────     │
│   │ P1 │ P2 │ P3 │   │   TOTAL: $XXX.XX     │
│   ├────┼────┼────┤   │                      │
│   │ P4 │ P5 │ P6 │   │   [Limpiar]          │
│   └────┴────┴────┘   │   [Procesar Pago]    │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

#### 2.2 Flujo de Usuario (Empleado)

1. **Inicio de Sesión**
   ```
   Login → Detecta rol: employee → Redirige a /pos
   ```

2. **Agregar Producto al Carrito**
   ```
   Opción A: Click en [Scanner] → Escanea → Agrega automáticamente
   Opción B: Búsqueda manual → Click en producto → Agrega
   Opción C: Click en card del grid → Agrega
   ```

3. **Modificar Carrito**
   ```
   En CartItem:
   - Input de cantidad: Editar directamente
   - Botón [-]: Reducir cantidad
   - Botón [+]: Aumentar cantidad
   - Botón [X]: Eliminar del carrito
   ```

4. **Procesar Venta**
   ```
   Click [Procesar Pago] → Modal de checkout
   → Seleccionar método: Efectivo/Tarjeta
   → Confirmar → Stock actualizado → Recibo
   → Carrito limpiado → Listo para siguiente venta
   ```

---

### Fase 3: Gestión de Estado del Carrito

#### Opción 1: Hook Local (Recomendado para MVP)

```typescript
// useCart.ts
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const addItem = (product: Product, quantity = 1) => {...};
  const updateQuantity = (productId: string, quantity: number) => {...};
  const removeItem = (productId: string) => {...};
  const clearCart = () => {...};
  const calculateTotals = () => {...};
  
  return { items, addItem, updateQuantity, removeItem, clearCart, totals };
};
```

#### Opción 2: Context Global (Para funcionalidad avanzada)

```typescript
// CartContext.tsx
export const CartProvider = ({ children }) => {
  // Estado global del carrito
  // Persistencia en localStorage
  // Sincronización entre pestañas
};
```

---

## 🎨 UI/UX Specifications

### Diseño Responsive

**Desktop/Tablet (Landscape)**
- Layout: 60% productos | 40% carrito
- Grid: 3-4 columnas de productos
- Carrito fijo a la derecha

**Mobile/Tablet (Portrait)**
- Layout: Stack vertical
- Toggle para mostrar/ocultar carrito
- Grid: 2 columnas de productos
- Carrito como drawer deslizable

### Componentes Clave

#### ProductCard (Mini)
```tsx
┌─────────────────┐
│  [Img]          │
│  Coca Cola 1L   │
│  $7.00          │
│  Stock: 52      │
│  [+ Agregar]    │
└─────────────────┘
```

#### CartItem
```tsx
┌────────────────────────────────────┐
│ Coca Cola 1L              x2       │
│ $7.00 c/u                          │
│ [-] 2 [+]  [X]     Subtotal: $14.00│
└────────────────────────────────────┘
```

#### Cart Summary
```tsx
┌────────────────────────────────────┐
│ Items: 5                           │
│ Subtotal:              $50.00      │
│ IVA (16%):             $8.00       │
│ ─────────────────────────────────  │
│ TOTAL:                 $58.00      │
│                                    │
│ [Limpiar Carrito]                  │
│ [Procesar Pago]                    │
└────────────────────────────────────┘
```

---

## 🔐 Validaciones y Seguridad

### Validaciones Frontend
- ✅ Cantidad > 0
- ✅ Cantidad <= stock disponible
- ✅ Carrito no vacío antes de procesar pago
- ✅ Productos de la tienda activa solamente

### Validaciones Backend
- ✅ Usuario tiene acceso a la tienda
- ✅ Productos existen y están activos
- ✅ Stock suficiente en el momento de la venta
- ✅ Transacción atómica (venta + actualización stock)
- ✅ Prevenir ventas duplicadas

### Seguridad
- ✅ JWT token válido
- ✅ Rol verificado (employee puede vender)
- ✅ Store access verificado
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS prevention (sanitización de inputs)

---

## 📊 Base de Datos

### Tabla: sales

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  sale_date TIMESTAMP DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card')),
  payment_status VARCHAR(20) DEFAULT 'completed',
  payment_received DECIMAL(10,2),
  change_returned DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: sale_items

```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices

```sql
CREATE INDEX idx_sales_store_id ON sales(store_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
```

---

## 🧪 Testing Checklist

### Testing Manual

#### Flujo Básico
- [ ] Employee login → Redirige a /pos
- [ ] Scanner agrega producto al carrito
- [ ] Búsqueda manual agrega producto
- [ ] Modificar cantidad en carrito
- [ ] Eliminar item del carrito
- [ ] Calcular totales correctamente
- [ ] Procesar venta en efectivo
- [ ] Stock actualizado después de venta

#### Validaciones
- [ ] No permite cantidad > stock
- [ ] No permite carrito vacío en checkout
- [ ] Valida stock en tiempo real
- [ ] Previene stock negativo

#### Edge Cases
- [ ] Producto sin stock disponible
- [ ] Carrito con muchos items (10+)
- [ ] Mismo producto agregado múltiples veces
- [ ] Cancelar venta limpia carrito
- [ ] Refresh de página mantiene carrito (localStorage)

---

## 📈 Métricas de Éxito

### Performance
- ⏱️ Agregar producto al carrito: < 100ms
- ⏱️ Procesar venta completa: < 2 segundos
- ⏱️ Actualizar stock: < 1 segundo

### Usabilidad
- 🎯 Empleado puede procesar venta en < 60 segundos
- 🎯 Reducción de errores de stock: 90%+
- 🎯 Scanner funciona en 80%+ de casos

### Negocio
- 💰 Ventas registradas correctamente: 100%
- 💰 Stock actualizado correctamente: 100%
- 💰 0 ventas con stock negativo

---

## 🚀 Plan de Implementación

### Día 1-2: Backend Foundation
- ✅ Crear tipos TypeScript
- ✅ Crear migraciones de base de datos
- ✅ Implementar SalesController
- ✅ Crear endpoints de carrito y ventas
- ✅ Testing de endpoints

### Día 3-4: Frontend POS Page
- ✅ Crear página /pos
- ✅ Implementar hook useCart
- ✅ Crear componente ShoppingCart
- ✅ Crear componente ProductGrid
- ✅ Integrar scanner con carrito

### Día 5-6: Checkout & Payment
- ✅ Crear CheckoutModal
- ✅ Implementar pago en efectivo
- ✅ Actualización de stock
- ✅ Validaciones completas

### Día 7: Testing & Polish
- ✅ Testing manual completo
- ✅ Ajustes de UI/UX
- ✅ Documentación
- ✅ Deploy

---

## 🔄 Próximos Pasos (Sprint 3.3)

- Integración con Stripe para pagos con tarjeta
- Generación de recibos PDF
- Historial de ventas detallado
- Reportes de ventas diarias
- Devoluciones/reembolsos

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **Carrito en Estado Local (no base de datos)**
   - Más rápido y responsive
   - No requiere API calls constantes
   - Persiste en localStorage para refresh

2. **Employee → /pos (no dashboard)**
   - Enfoque en tarea principal: ventas
   - UI simplificada
   - Menos distracciones

3. **Stock Validation en Backend**
   - Doble validación: frontend (UX) + backend (seguridad)
   - Previene race conditions
   - Transacciones atómicas

4. **Scanner Reutilizado de Sprint 3.1**
   - Mismos componentes
   - Mismo endpoint de búsqueda
   - Callback diferente (agregar a carrito vs buscar)

---

**Estado Actual**: 🚧 Iniciando Implementación  
**Siguiente Paso**: Crear tipos TypeScript y controladores del backend  
**Fecha de Actualización**: 14 de Octubre, 2025


