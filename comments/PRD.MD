# Documento de Requisitos del Producto (PRD) para Flowence - Multi-Store Management

## 1. Introducción

### 1.1 Visión General del Producto
Flowence es una plataforma web progresiva (PWA) diseñada para simplificar la gestión de múltiples supermercados o almacenes. **La característica clave es que cada owner puede gestionar múltiples tiendas desde una sola cuenta**, con roles diferenciados (owner/empleado) y funcionalidades para manejar inventario y ventas independientes por tienda. El MVP se centra en autenticación, gestión multi-tienda, invitaciones por tienda, inventario por tienda y ventas con scanner.

**🏪 Capacidad Multi-Tienda:** A diferencia de sistemas tradicionales, Flowence permite a un emprendedor gestionar todas sus ubicaciones de negocio desde una sola cuenta, con cambio fluido entre tiendas y datos completamente aislados.

### 1.2 Alcance del MVP
- **Incluye:** 
  - Autenticación con creación automática de primera tienda
  - Gestión de múltiples tiendas por owner
  - Invitaciones de empleados por tienda específica
  - Inventario independiente por tienda
  - Ventas con scanner por tienda
  - Procesamiento básico de pagos
  - Configuración independiente por tienda
  
- **Excluye (para futuras versiones):**
  - Transferencias de inventario entre tiendas
  - Reportes consolidados multi-tienda
  - Empleados trabajando en múltiples tiendas
  - Gestión de franquicias
  - Modo offline
  - Integraciones avanzadas (ERP, contabilidad)

### 1.3 Versión y Fecha
- **Versión:** 1.0 (MVP) - Multi-Store Edition
- **Fecha de Creación:** Octubre 2025
- **Arquitectura:** Multi-tienda desde el diseño inicial

---

## 2. Objetivos y Metas

### 2.1 Objetivos de Negocio
- Permitir a emprendedores gestionar múltiples ubicaciones de negocio desde una sola cuenta
- Reducir errores manuales en inventario y ventas en al menos un 50%
- Facilitar la expansión de negocios pequeños a múltiples ubicaciones
- Acelerar el proceso de ventas (de minutos a segundos vía scanner)
- Proporcionar herramienta escalable para emprendedores en Latinoamérica/España

### 2.2 Metas del MVP
- Lanzar versión funcional donde un owner puede:
  - Crear y gestionar múltiples tiendas
  - Cambiar entre tiendas sin cerrar sesión
  - Invitar empleados específicos a cada tienda
  - Mantener inventario independiente por tienda
  - Procesar ventas en cualquier tienda
- Tiempo de cambio entre tiendas < 2 segundos
- Datos completamente aislados entre tiendas

### 2.3 Métricas de Éxito
- **Adopción:** 10+ owners gestionando 15+ tiendas en primer mes
- **Uso:** 80% de ventas procesadas sin errores
- **Multi-tienda:** Owners con promedio de 2-3 tiendas por cuenta
- **Feedback:** NPS > 7/10
- **Técnicas:** Tiempo de respuesta < 2s; uptime 99%

---

## 3. Audiencia Objetivo

### Usuarios Primarios

#### Owners/Admins
- Dueños con múltiples ubicaciones (2-10 tiendas)
- Emprendedores en expansión
- Necesitan vista consolidada y gestión independiente por tienda
- Control total sobre todas las tiendas

#### Empleados
- Cajeros/reponedores asignados a tienda específica
- Acceso limitado a su tienda asignada
- No ven otras tiendas del owner

### Características Demográficas
- Emprendedores 25-50 años
- Sector retail con múltiples ubicaciones
- Conocimiento básico de tecnología

### Pain Points Resueltos
- **Gestión fragmentada:** Tener que usar múltiples sistemas para diferentes tiendas
- **Cambio de contexto:** Necesidad de cerrar y abrir sesión para cambiar de tienda
- **Datos duplicados:** Reingreso de información en múltiples sistemas
- **Falta de visión global:** No poder ver todas las tiendas en un solo lugar
- **Escalabilidad limitada:** Sistemas que no crecen con el negocio

---

## 4. Requisitos Funcionales

### 4.1 Autenticación Multi-Tienda (Auth)

#### RF1.1: Registro de Owner con Primera Tienda
- Formulario con: email, contraseña, nombre personal, nombre de la tienda
- Al registrarse, automáticamente se crea:
  - Cuenta de usuario con rol "owner"
  - Primera tienda asociada
  - Relación usuario-tienda
- Validación de email único
- Contraseña mínimo 8 caracteres con complejidad
- Redirección a dashboard con tienda activa

#### RF1.2: Login Multi-Tienda
- Login unificado con email/contraseña
- Respuesta incluye array de tiendas accesibles
- Si owner: lista todas sus tiendas
- Si empleado: lista tiendas donde está invitado
- Token JWT incluye información de usuario y tiendas
- Auto-selección de última tienda usada (localStorage)

#### RF1.3: Sesión y Tokens
- JWT con expiración de 30 minutos
- Token incluye user_id y rol
- Refresh token para renovación
- Logout limpia tokens y contexto de tienda

#### RF1.4: Recuperación de Contraseña
- Envío de email con link temporal
- Token de recuperación válido por 1 hora
- Validación de nueva contraseña

---

### 4.2 Gestión Multi-Tienda ⭐

#### RF2.1: Creación de Tiendas
- Owner puede crear tiendas ilimitadas
- Formulario: nombre, dirección, teléfono, moneda, tasa de impuesto
- Tienda se asocia automáticamente al owner
- Owner tiene rol "owner" en la tienda creada

#### RF2.2: Listado de Tiendas
- Owner ve todas sus tiendas
- Empleado ve solo tiendas asignadas
- Cada tienda muestra: nombre, dirección, rol del usuario
- Indicador visual de tienda actualmente seleccionada

#### RF2.3: Selector de Tienda Activa
- Componente visible en todo momento
- Dropdown con lista de tiendas accesibles
- Cambio de tienda sin re-autenticación
- Contexto de tienda persiste en localStorage
- Actualización de datos al cambiar tienda

#### RF2.4: Edición de Tienda
- Solo owner puede editar
- Actualización de información básica
- Configuración específica de tienda
- Cambios se reflejan inmediatamente

#### RF2.5: Eliminación de Tienda
- Solo owner puede eliminar
- Confirmación de eliminación
- Eliminación en cascada de:
  - Productos de la tienda
  - Ventas históricas
  - Invitaciones pendientes
  - Relaciones usuario-tienda
- No permite eliminar si es la única tienda del owner

#### RF2.6: Contexto de Tienda Activa
- Siempre hay una tienda activa seleccionada
- Todas las operaciones usan tienda activa
- Indicador visual permanente de tienda activa
- Breadcrumbs incluyen nombre de tienda

---

### 4.3 Invitaciones por Tienda

#### RF3.1: Invitación de Empleados
- Owner invita empleado a **tienda específica**
- Formulario: email, tienda destino, rol (empleado)
- Generación de token único válido 24 horas
- Envío de email con link de invitación
- Email indica nombre de tienda a la que se invita

#### RF3.2: Aceptación de Invitación
- Empleado accede al link único
- Si no tiene cuenta: crea contraseña y acepta
- Si ya tiene cuenta: solo acepta invitación
- Se crea relación user_store con tienda específica
- Empleado gana acceso a esa tienda solamente

#### RF3.3: Gestión de Usuarios por Tienda
- Owner ve lista de empleados por tienda
- Puede ver invitaciones pendientes por tienda
- Puede revocar invitaciones
- Puede remover empleados de tienda específica
- Empleado removido pierde acceso a esa tienda

#### RF3.4: Validación de Acceso
- Middleware valida acceso a tienda en cada request
- Usuario debe tener relación user_store válida
- Error 403 si intenta acceder a tienda no asignada

---

### 4.4 Inventario por Tienda ⭐

#### RF4.1: Productos Específicos por Tienda
- Cada producto pertenece a **una tienda específica**
- Campo store_id obligatorio en productos
- Barcode único por tienda (no globalmente)
- Mismo barcode puede existir en diferentes tiendas

#### RF4.2: Registro de Productos
- Owner agrega productos a tienda activa
- Campos: nombre, barcode, precio, costo, stock, categoría, descripción
- Validación de barcode único dentro de la tienda
- Producto asociado automáticamente a tienda activa

#### RF4.3: Listado de Productos
- Solo muestra productos de tienda activa
- Filtros y búsqueda dentro de tienda activa
- Paginación de resultados
- Empleados ven productos (solo lectura para algunos campos)

#### RF4.4: Edición de Productos
- Owner puede editar cualquier campo
- Cambios afectan solo a producto de tienda actual
- Validación de barcode al editar (único en tienda)

#### RF4.5: Stock por Tienda
- Stock es independiente por tienda
- Mismo producto en diferentes tiendas = diferentes stocks
- Alertas de stock bajo por tienda
- Threshold configurable por tienda

#### RF4.6: Búsqueda por Barcode
- Búsqueda limitada a tienda activa
- Si barcode no existe en tienda activa: no encontrado
- Opción de crear producto si no existe

---

### 4.5 Scanner/Ventas por Tienda

#### RF5.1: Scanner con Contexto de Tienda
- Scanner busca productos en tienda activa solamente
- Integración con QuaggaJS
- Validación de producto en tienda actual
- Fallback a entrada manual

#### RF5.2: Carrito de Ventas
- Carrito es específico de tienda activa
- Solo puede contener productos de tienda activa
- Validación de stock en tienda activa
- Cálculo de impuestos según configuración de tienda

#### RF5.3: Procesamiento de Pagos
- Venta asociada a tienda activa
- Campo store_id en registro de venta
- Soporte para efectivo y tarjeta
- Stock actualizado en tienda activa solamente

#### RF5.4: Recibo de Venta
- Recibo incluye información de tienda
- Dirección y datos de tienda activa
- PDF generado con branding de tienda
- Registro de venta con store_id

#### RF5.5: Historial de Ventas
- Listado filtrado por tienda activa
- Owner puede ver ventas de cualquier tienda
- Empleado solo ve ventas de su tienda
- Filtros de fecha, empleado, método de pago

#### RF5.6: Devoluciones
- Devolución afecta solo tienda de la venta original
- Stock se restaura en tienda correcta
- Validación de tienda activa = tienda de venta

---

### 4.6 Configuración por Tienda

#### RF6.1: Configuración Independiente
- Cada tienda tiene configuración propia
- Moneda específica por tienda
- Tasa de impuesto específica por tienda
- Threshold de stock bajo por tienda

#### RF6.2: Información de Tienda
- Nombre, dirección, teléfono
- Logo de tienda (opcional)
- Información para recibos
- Datos de contacto

#### RF6.3: Configuración de Alertas
- Nivel mínimo de stock configurable
- Alertas específicas por tienda
- Notificaciones por tienda

---

### 4.7 Dashboard Multi-Tienda

#### RF7.1: Dashboard para Owner
- Vista de todas las tiendas
- Métricas resumidas por tienda
- Comparación entre tiendas
- Acceso rápido a cada tienda

#### RF7.2: Dashboard para Empleado
- Vista de tienda asignada solamente
- No ve selector de tiendas
- Dashboard específico de su tienda

---

### 4.8 Seguridad y Aislamiento de Datos

#### RF8.1: Aislamiento de Datos
- Queries incluyen filtro store_id
- Foreign keys aseguran relaciones
- Middleware valida acceso a tienda
- Logs incluyen store_id

#### RF8.2: Validación de Acceso
- Cada request valida user_store relationship
- Error 403 si usuario no tiene acceso
- Logs de intentos de acceso no autorizado

#### RF8.3: Auditoría
- Todos los cambios registran store_id
- Historial de cambios por tienda
- Quién hizo qué en qué tienda

---

## 5. Requisitos No Funcionales

### 5.1 Rendimiento
- Cambio de tienda < 2 segundos
- Carga de productos < 3 segundos
- Procesamiento de venta < 5 segundos
- Respuesta de API < 500ms promedio

### 5.2 Escalabilidad
- Soporte para owners con 1-100 tiendas
- 1-50 empleados por tienda
- 10,000+ productos por tienda
- 1,000+ ventas diarias por tienda

### 5.3 Seguridad
- HTTPS obligatorio
- JWT con expiración
- Passwords hasheados con bcrypt
- Validación de acceso a tienda en cada request
- Protección contra SQL injection
- Protección contra XSS
- Rate limiting por IP

### 5.4 Usabilidad
- Indicador claro de tienda activa siempre visible
- Cambio de tienda intuitivo (1-2 clicks)
- Diseño responsive para tablet/móvil
- Interfaz en español
- Feedback claro en operaciones

### 5.5 Disponibilidad
- Uptime 99%+
- Backup diario automático
- Recuperación ante fallos
- Monitoreo de errores

---

## 6. Flujos de Usuario Multi-Tienda

### 6.1 Flujo de Registro de Owner
1. Owner accede a registro
2. Ingresa: email, password, nombre, **nombre de primera tienda**
3. Sistema crea cuenta + primera tienda automáticamente
4. Redirección a dashboard con tienda activa
5. Bienvenida y opción de crear más tiendas

### 6.2 Flujo de Creación de Segunda Tienda
1. Owner en dashboard
2. Click en "Crear Nueva Tienda"
3. Formulario: nombre, dirección, configuración
4. Tienda creada y añadida a lista
5. Opción de cambiar a nueva tienda

### 6.3 Flujo de Cambio de Tienda
1. Owner/Empleado ve selector en header
2. Click en selector → dropdown con tiendas
3. Selecciona otra tienda
4. Contexto cambia, datos se recargan
5. URL puede actualizar (?store_id=X)
6. Toda la app ahora opera en nueva tienda

### 6.4 Flujo de Invitación por Tienda
1. Owner en tienda específica
2. Va a "Usuarios" → "Invitar Empleado"
3. Ingresa email, **la tienda ya está seleccionada**
4. Empleado recibe email con nombre de tienda
5. Empleado acepta y queda asignado a esa tienda
6. Empleado solo verá esa tienda al login

### 6.5 Flujo de Venta en Tienda Específica
1. Empleado/Owner en tienda activa
2. Scanner lee barcode
3. Sistema busca producto **en tienda activa solamente**
4. Añade al carrito
5. Procesa venta
6. Venta registrada con store_id
7. Stock actualizado **en tienda activa**
8. Recibo con datos de tienda activa

### 6.6 Flujo de Owner con Múltiples Tiendas
1. Login → ve 3 tiendas disponibles
2. Dashboard muestra overview de las 3
3. Click en "Tienda Downtown" → cambia contexto
4. Gestiona productos de Downtown
5. Procesa ventas en Downtown
6. Cambia a "Tienda Uptown"
7. Ahora gestiona Uptown
8. Datos de Downtown no visibles en este contexto

---

## 7. Modelo de Datos Multi-Tienda

### 7.1 Entidades Principales

#### Users
```
- id (UUID)
- email (unique)
- password_hash
- name
- role (owner | employee)
```

#### Stores ⭐
```
- id (UUID)
- owner_id (FK → users.id)
- name
- address
- phone
- currency
- tax_rate
- low_stock_threshold
```

#### UserStores ⭐ (Many-to-Many)
```
- id (UUID)
- user_id (FK → users.id)
- store_id (FK → stores.id)
- role (owner | employee)
- UNIQUE(user_id, store_id)
```

#### Products
```
- id (UUID)
- store_id (FK → stores.id) ⭐
- name
- barcode
- price
- cost
- stock
- category
- UNIQUE(store_id, barcode) ⭐
```

#### Sales
```
- id (UUID)
- store_id (FK → stores.id) ⭐
- user_id (FK → users.id)
- total
- payment_method
- created_at
```

#### SaleItems
```
- id (UUID)
- sale_id (FK → sales.id)
- product_id (FK → products.id)
- quantity
- price
```

#### Invitations
```
- id (UUID)
- store_id (FK → stores.id) ⭐
- email
- token (unique)
- status
- expires_at
```

### 7.2 Relaciones Clave
- User ←→ Stores (Many-to-Many via UserStores)
- Store → Products (One-to-Many)
- Store → Sales (One-to-Many)
- Store → Invitations (One-to-Many)

---

## 8. Consideraciones Técnicas

### 8.1 Stack Tecnológico
- **Frontend:** Next.js 14+ con TypeScript, Tailwind CSS
- **Backend:** Node.js/Express con TypeScript
- **Base de Datos:** PostgreSQL (Supabase)
- **Auth:** JWT + Supabase Auth
- **Scanner:** QuaggaJS
- **Pagos:** Stripe
- **Email:** SendGrid

### 8.2 Arquitectura Multi-Tienda
- Contexto de tienda en React Context
- Store_id en todas las queries
- Middleware de validación de acceso
- Índices en store_id para performance
- Constraints de FK para integridad

### 8.3 Testing
- Tests de aislamiento de datos entre tiendas
- Tests de cambio de tienda
- Tests de acceso no autorizado
- Tests de flujos multi-tienda
- E2E con múltiples tiendas

---

## 9. Asunciones y Riesgos

### 9.1 Asunciones
- Owners típicamente tendrán 2-5 tiendas
- Empleados trabajarán en una sola tienda (inicialmente)
- Internet estable en tiendas
- Dispositivos modernos con cámara

### 9.2 Riesgos Multi-Tienda
| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Confusión de tienda activa | Alto | Medio | Indicador visual prominente |
| Acceso a tienda incorrecta | Alto | Bajo | Validación estricta en middleware |
| Performance con muchas tiendas | Medio | Bajo | Índices optimizados, paginación |
| Complejidad UI para cambio | Medio | Medio | Diseño UX cuidadoso, testing |
| Datos mezclados entre tiendas | Crítico | Bajo | Constraints DB, tests exhaustivos |

---

## 10. Roadmap Post-MVP

### Fase 2: Funcionalidades Avanzadas
- Transferencias de inventario entre tiendas
- Reportes consolidados multi-tienda
- Comparación de performance entre tiendas
- Empleados en múltiples tiendas

### Fase 3: Características Empresariales
- Gestión de franquicias
- Roles personalizados por tienda
- Integraciones contables
- API para terceros

### Fase 4: Optimizaciones
- Modo offline por tienda
- Sincronización avanzada
- Analytics predictivos
- Machine learning para inventario

---

**Versión:** 1.0 - Multi-Store MVP  
**Fecha:** Octubre 2025  
**Estado:** Especificación Completa  
**Próximo Paso:** Iniciar Fase 1 de Implementación
