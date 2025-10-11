# 🚀 Guía Rápida de Testing - Todo lo Nuevo

## ⚡ Inicio Rápido (5 minutos)

### **Paso 1: Aplicar Migración (1 min)**

1. Abrir Supabase Dashboard → SQL Editor
2. Copiar contenido de `server/combined-migrations.sql`
3. Pegar y ejecutar
4. Verificar que no hay errores

✅ **Migración aplicada**

---

### **Paso 2: Insertar Productos de Prueba (1 min)**

Ejecutar este SQL en Supabase:

```sql
-- 10 productos de prueba rápidos
INSERT INTO products (store_id, name, barcode, sku, category, price, cost, stock, min_stock, unit) VALUES
('ce8ecfd9-f0e1-457f-8fbb-2a69ca12b0d7', 'Coca Cola 600ml', '7891234567890', 'CC-600', 'Bebidas', 2.50, 1.50, 100, 20, 'unit'),
('ce8ecfd9-f0e1-457f-8fbb-2a69ca12b0d7', 'Sprite 600ml', '7891234567892', 'SP-600', 'Bebidas', 2.50, 1.50, 5, 20, 'unit'),
('ce8ecfd9-f0e1-457f-8fbb-2a69ca12b0d7', 'Doritos 150g', '7891234560001', 'DOR-150', 'Snacks', 3.99, 2.00, 80, 15, 'unit'),
('ce8ecfd9-f0e1-457f-8fbb-2a69ca12b0d7', 'Cheetos 100g', '7891234560002', 'CHE-100', 'Snacks', 2.99, 1.50, 4, 10, 'unit'),
('ce8ecfd9-f0e1-457f-8fbb-2a69ca12b0d7', 'Leche 1L', '7891234570001', 'LE-1000', 'Lácteos', 3.50, 2.00, 40, 10, 'unit');
```

✅ **5 productos creados**

---

### **Paso 3: Iniciar Servidores (1 min)**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd flowence-client
npm run dev
```

✅ **Servidores corriendo**

---

### **Paso 4: Login (30 segundos)**

1. Ir a `http://localhost:3000/login`
2. Email: `owner@flowence.com`
3. Password: (tu password)
4. Login

✅ **Autenticado**

---

### **Paso 5: Probar Todo (2 minutos)**

#### **a) Sistema de Tokens (Background)**
- Abrir DevTools Console
- Ver mensaje: `⏰ Setting up token auto-refresh (every 25 minutes)`
- ✅ Token se renovará automáticamente

#### **b) Navegación**
- Clic en "Dashboard" → Se queda en dashboard
- Clic en "Productos" → Va a productos
- Clic en "Tiendas" → Va a tiendas
- ✅ Links siempre visibles, link activo en azul

#### **c) Productos**
- Ir a `/products`
- Ver 5 productos en la lista
- ✅ Productos cargados

#### **d) Búsqueda con Debounce**
- Escribir lentamente: "c" ... "o" ... "c" ... "a"
- Ver spinner aparecer mientras escribes
- Después de 500ms → Lista se filtra
- ✅ Solo 1 request en Network tab

#### **e) Filtros**
- Seleccionar categoría "Bebidas" → 2 productos
- Click en "Stock Bajo" → 2 productos (Sprite y Cheetos)
- ✅ Filtros funcionan

#### **f) Crear Producto**
- Click "Agregar Producto"
- Llenar formulario
- Guardar
- ✅ Producto aparece en lista

#### **g) Responsive (Mobile)**
- F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Seleccionar iPhone 12 Pro
- Ver menú hamburguesa
- Ver cards en lugar de tabla
- ✅ Todo funciona en móvil

---

## 📱 Checklist Rápido Mobile

En modo Device (iPhone 12 Pro):

- [ ] **Navbar:** Menú hamburguesa visible
- [ ] **StoreSelector:** Aparece debajo del navbar
- [ ] **Dashboard:** Stats en 2x2, botones grandes
- [ ] **Products:** Cards en lugar de tabla
- [ ] **Stores:** Cards responsive
- [ ] **Employees:** Cards responsive
- [ ] **Modales:** Se adaptan a pantalla
- [ ] **Formularios:** Campos y botones grandes
- [ ] **Búsqueda:** Input full-width con spinner

---

## 🔍 Testing de Features Específicas

### **1. Token Auto-Refresh (25 min)**

**Prueba larga pero automática:**
1. Hacer login
2. Dejar la aplicación abierta
3. Esperar 25 minutos
4. En consola verás: `🔄 Auto-refreshing token...`
5. Seguir usando la app normalmente

✅ **No te desloguea**

---

### **2. Interceptor 401 (Simulación en 2 min)**

**Prueba rápida:**
1. Editar `server/src/services/AuthService.ts` línea 220:
   ```typescript
   expiresIn: '1m', // Temporal
   ```
2. Rebuild: `npm run build && npm run dev`
3. Login de nuevo
4. Esperar 1 minuto
5. Hacer cualquier acción
6. Ver en consola: `🔑 Received 401, attempting token refresh...`
7. ✅ Acción se completa sin error
8. **Revertir:** `'1m'` → `'30m'`

---

### **3. Búsqueda con Debounce (30 segundos)**

1. Ir a `/products`
2. Abrir DevTools → Network tab
3. Escribir rápidamente: "coca cola"
4. Observar:
   - Spinner aparece inmediatamente
   - Solo 1 request después de 500ms
   - Spinner desaparece
5. ✅ Optimización funciona

---

### **4. Stock Bajo (30 segundos)**

1. En `/products`, click "Stock Bajo"
2. Deberías ver solo:
   - Sprite (stock: 5, min: 20)
   - Cheetos (stock: 4, min: 10)
3. ✅ Filtro funciona

---

### **5. Crear Producto (1 min)**

1. Click "Agregar Producto"
2. Llenar:
   - Nombre: "Producto Test"
   - Precio: 10.00
   - Costo: 5.00
   - Stock: 50
3. Guardar
4. Verificar:
   - ✅ Aparece en lista
   - ✅ Muestra margen: 100%
   - ✅ Total productos incrementa

---

### **6. Mobile Experience (2 min)**

1. F12 → Device Toolbar
2. iPhone 12 Pro
3. Probar:
   - [ ] Menú hamburguesa abre/cierra
   - [ ] StoreSelector funciona
   - [ ] Dashboard muestra 4 stats
   - [ ] Products muestra cards
   - [ ] Botones se pueden tocar fácilmente
   - [ ] Modal de crear producto se ve bien
   - [ ] Búsqueda funciona

---

## 🎯 Resultados Esperados

### **Dashboard:**
```
✅ 4 stats cards
✅ Quick actions
✅ Responsive
✅ Links funcionan
```

### **Products:**
```
✅ Lista de 5 productos
✅ Stats: Total=5, Valor=$XX.XX, Stock Bajo=2, Sin Stock=0
✅ Búsqueda con debounce funciona
✅ Filtros funcionan
✅ Crear producto funciona
✅ Mobile view = cards
```

### **Navbar:**
```
✅ Desktop: Links horizontales
✅ Mobile: Menú hamburguesa
✅ Link activo en azul
✅ No recarga si ya estás en la página
```

---

## 🚨 Troubleshooting Rápido

### **Error: "Store ID is required"**
→ Reiniciar servidor backend (npm run dev)

### **Error: "column sku does not exist"**
→ Aplicar migración en Supabase

### **No aparecen productos**
→ Verificar que los insertaste con el store_id correcto

### **Token expira**
→ Verificar consola: debe decir "Setting up token auto-refresh"

### **Navbar no responsive**
→ Hard refresh (Ctrl+Shift+R)

---

## ✅ Lista de Verificación Final

Marca lo que funciona:

- [ ] **Login** funciona
- [ ] **Dashboard** carga sin errores
- [ ] **Navbar** muestra todos los links
- [ ] **Products** muestra lista de productos
- [ ] **Búsqueda** tiene debounce (spinner aparece)
- [ ] **Filtros** funcionan (categoría, stock bajo)
- [ ] **Crear producto** funciona
- [ ] **Editar producto** funciona
- [ ] **Eliminar producto** funciona
- [ ] **Mobile view** funciona (menú hamburguesa)
- [ ] **Products mobile** muestra cards
- [ ] **Token** no expira (mensaje en consola)

---

## 🎊 Si Todo Funciona

**¡Felicidades!** 🎉

Tienes:
- Sistema de autenticación robusto
- Multi-tiendas funcionando
- Invitaciones completas
- **Inventario completo con búsqueda optimizada**
- **Diseño responsive en todos los dispositivos**

**Próximo paso:** Sprint 2.2 Part 2 (Barcode Scanner) o Sprint 2.3 (Sales/POS)

---

**Tiempo total de testing:** ~10 minutos  
**Dificultad:** Fácil  
**Prerequisitos:** Migración aplicada, servidores corriendo

