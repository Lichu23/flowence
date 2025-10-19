# ✅ Sprint 3.3 – Sales Processing Part 2: Test Plan

Fecha: 2025-10-16
Estado: Listo para verificación manual (Frontend + Backend)

## Alcance de Pruebas
- Pagos con tarjeta (Stripe – creación de PaymentIntent)
- Generación de recibos PDF por venta
- Historial de ventas por tienda con filtros y paginación
- Devoluciones (refund) con reversión de stock y auditoría
- Flujo de efectivo existente sigue funcionando

## Pre-requisitos
1. Backend corriendo: `cd server && npm run dev`
2. Frontend corriendo: `cd flowence-client && npm run dev`
3. Variables de entorno:
   - `STRIPE_SECRET_KEY` configurada (modo test)
   - `NEXT_PUBLIC_API_URL` apuntando al backend (p.ej. `http://localhost:3002`)
4. Usuario Owner y Employee creados (o usar seed)
5. Tienda con productos activos y stock_venta > 0

---

## Casos de Prueba

### 1) Pago en Efectivo (Regresión)
- Navegar a `/pos` como empleado
- Agregar 2 productos al carrito (sumar cantidades)
- Validar stock (modal se abre)
- Seleccionar método: Efectivo
- Ingresar monto recibido ≥ total
- Confirmar

Validar:
- Aparece alerta con número de recibo
- Carrito se limpia
- En BD: `sales` con payment_method = `cash`, payment_status = `completed`
- `sale_items` creados
- `stock_movements` con type = `sale` y stock_venta decrementado

### 2) Pago con Tarjeta (Stripe – PaymentIntent)
- Navegar a `/pos`
- Agregar 1–2 productos al carrito
- Abrir modal de pago → seleccionar método: Tarjeta
- Confirmar (crea PaymentIntent en backend)

Validar:
- No error en UI
- En red (devtools): `POST /api/stores/:storeId/payments/intents` → 201 con `client_secret`
- Luego se procesa la venta: `POST /api/stores/:storeId/sales` con `payment_method=card`
- En BD: `sales.payment_method = 'card'`, `payment_status = 'completed'`
- `stock_movements` con type `sale`

Nota: Confirmación de tarjeta (Elements/terminal) se implementará posteriormente. En este MVP, asumimos confirmación externa.

### 3) Historial de Ventas por Tienda
- Navegar a `/sales`
- Ver tabla con ventas recientes
- Usar filtros:
  - Método: cash / card / mixed / Todos
  - Estado: completed / refunded / pending / cancelado / Todos
- Paginación: avanzar/retroceder si hay >20

Validar:
- La tabla refleja filtros
- Totales mostrados por fila correctos
- Navegación por páginas funcional

### 4) Descarga de Recibo (PDF)
- En `/sales`, click en enlace “PDF” de una venta

Validar:
- Descarga/abre un PDF con:
  - Encabezado: nombre de tienda, dirección (si existe), teléfono (si existe)
  - Número de recibo, fecha, método, estado
  - Tabla de items con cantidad, unitario, descuento, total
  - Totales: subtotal, impuestos, descuento, total final

### 5) Devolución (Refund) con Reversión de Stock (Owner)
- Ingresar como Owner
- Ir a `/sales`
- En una venta con `payment_status !== refunded`, click “Devolver” → Confirmar

Validar:
- Fila muestra `payment_status = refunded`
- En BD: `sales.payment_status` pasa a `refunded`
- `stock_movements` registra `movement_type = 'return'` con cantidades revertidas
- Stock del producto incrementa la cantidad devuelta en el stock correspondiente (`venta` o `deposito` del item)

### 6) Seguridad y Permisos
- Employee no debe ver botón “Devolver”
- Owner puede ver “Devolver”
- Rutas protegidas requieren JWT válido
- Filtros de ventas: empleado solo sus ventas (si aplica política), owner todas

---

## Endpoints Clave (Backend)
- Crear venta: `POST /api/stores/:storeId/sales`
- Listar ventas: `GET /api/stores/:storeId/sales?payment_method=&payment_status=&page=&limit=`
- Obtener venta: `GET /api/stores/:storeId/sales/:saleId`
- PDF de recibo: `GET /api/stores/:storeId/sales/:saleId/receipt`
- Refund: `POST /api/stores/:storeId/sales/:saleId/refund`
- PaymentIntent (Stripe): `POST /api/stores/:storeId/payments/intents`

---

## Criterios de Aceptación
- Ventas en efectivo y tarjeta registran correctamente con stock descontado
- Historial de ventas muestra filtros y paginación
- PDF descargable con datos correctos
- Refund actualiza estado y revierte stock con auditoría
- Sin errores de TypeScript ni linter en cambios

## Observaciones
- Confirmación de tarjeta (Stripe Elements/Terminal) queda para siguiente iteración
- Probar con productos que tengan distintos `stock_type` en items (venta/deposito)

---

## Checklist Rápido
- [ ] Pago efectivo OK
- [ ] PaymentIntent creado OK
- [ ] Venta con método `card` OK
- [ ] Historial con filtros OK
- [ ] PDF correcto por venta
- [ ] Refund y stock revertido OK
- [ ] Permisos (Owner/Employee) respetados
