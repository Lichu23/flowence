# Documento de Requisitos del Producto (PRD) para la App "All-in-One" de Gestión de Supermercado/Almacén

## 1. Introducción

### 1.1 Visión General del Producto
La app "All-in-One" es una plataforma web progresiva (PWA) diseñada para simplificar la gestión de un supermercado o almacén pequeño/mediano. Enfocada en roles diferenciados (admin/owner y empleados), permite un acceso unificado vía autenticación, con funcionalidades clave para manejar inventario y ventas con actualizaciones al refrescar la página. El MVP (Minimum Viable Product) se centra en las prioridades identificadas: autenticación, invitaciones, inventario básico y scanner/ventas. Esto resuelve pain points iniciales como control de accesos, sincronización de stock y procesamiento de transacciones, cubriendo aproximadamente el 80% de los problemas operativos comunes en el setup de un negocio retail.  
La app será accesible vía web, con diseño responsivo para dispositivos móviles (e.g., tablets en tienda), y priorizará usabilidad, seguridad y escalabilidad.

### 1.2 Alcance del MVP
- Incluye: Autenticación, gestión de usuarios/invitaciones, inventario básico (registro y actualizaciones), y módulo de ventas con scanner y procesamiento básico de pagos.  
- Excluye: Funcionalidades avanzadas como reportes detallados, integraciones con proveedores, analíticas, multi-tiendas, notificaciones push, modo offline o integraciones complejas (e.g., IA para predicciones). Estas se considerarán en iteraciones futuras.

### 1.3 Versión y Fecha
- Versión: 1.0 (MVP)  
- Fecha de Creación del PRD: Octubre 2025  
- Equipo Responsable: [A definir - e.g., Desarrollador/Producto Owner]  

## 2. Objetivos y Metas

### 2.1 Objetivos de Negocio
- Reducir errores manuales en inventario y ventas en al menos un 50% para nuevos negocios retail.  
- Facilitar la colaboración entre owner y empleados con accesos controlados.  
- Acelerar el proceso de ventas (e.g., de minutos a segundos vía scanner).  
- Proporcionar una herramienta accesible y de bajo costo para emprendedores en Latinoamérica/España.

### 2.2 Metas del MVP
- Lanzar una versión funcional que permita a un owner registrar productos, invitar empleados, y procesar ventas con actualizaciones de stock al refrescar la página.  
- Lograr una usabilidad alta: Tiempo de onboarding < 5 minutos; procesamiento de venta < 1 minuto.  
- Asegurar seguridad básica: Protección contra accesos no autorizados y datos sensibles encriptados.

### 2.3 Métricas de Éxito
- Adopción: Al menos 10 usuarios beta (owners) en el primer mes post-lanzamiento.  
- Uso: 80% de ventas procesadas vía app sin errores.  
- Feedback: NPS > 7/10 en pruebas iniciales.  
- Técnicas: Tiempo de respuesta < 2s por acción; uptime 99%.

## 3. Audiencia Objetivo

### Usuarios Primarios
- Owners/Admins: Dueños de supermercados/almacenes pequeños (1-10 empleados), con necesidades de control total.  
- Empleados: Cajeros/reponedores, que necesitan acceso rápido a ventas e inventario sin permisos de edición.

Características Demográficas: Emprendedores de 25-50 años, en sectores retail, con conocimiento básico de tecnología (smartphones/web).  
Pain Points Resueltos: Falta de sincronización en equipo, errores en stock, procesos manuales lentos.

## 4. Requisitos Funcionales
Los requisitos se dividen por módulo prioritario del MVP.

### 4.1 Autenticación (Auth)
- RF1.1: Registro de usuario para owners: Formulario con email, contraseña (mínimo 8 chars, con validación), nombre y nombre de la tienda.  
- RF1.2: Login unificado: Todos los usuarios (owners/empleados) acceden vía email/contraseña. Redirección a dashboard basado en rol.  
- RF1.3: Recuperación de contraseña: Envío de email con enlace temporal para reset.  
- RF1.4: Sesión segura: Tokens JWT para autenticación; logout automático tras 30 min de inactividad.  
- RF1.5: Validación de roles: Al login, verificar rol (admin/empleado) para restringir vistas/acciones.

### 4.2 Invitaciones y Gestión de Usuarios
- RF2.1: Invitación por owner: Formulario para enviar invitación vía email (incluye enlace único temporal, válido 24h).  
- RF2.2: Aceptación de invitación: Empleado accede al enlace, crea contraseña y se une a la tienda específica.  
- RF2.3: Lista de usuarios: Owner ve y gestiona empleados (ver, editar rol, eliminar).  
- RF2.4: Permisos granulares: Empleados solo ven/usan ventas e inventario básico; no editan productos ni usuarios.

### 4.3 Inventario Básico
- RF3.1: Registro de productos: Owner agrega productos con campos: nombre, código de barras, precio venta, costo, cantidad inicial, categoría (opcional), descripción (opcional).  
- RF3.2: Edición/Eliminación: Owner edita o borra productos; actualizaciones visibles al refrescar la página.  
- RF3.3: Búsqueda y visualización: Lista paginada de productos con filtros (nombre, código, categoría); visible para empleados (solo lectura).  
- RF3.4: Actualización de stock: Automática en el servidor al confirmar ventas (resta cantidades); manual por owner para ajustes (e.g., recepciones básicas). Cambios visibles al refrescar la página.  
- RF3.5: Alertas simples: Notificación en app si stock < 5 (configurable), visible al cargar o refrescar la página.
- RF3.6: Validación de stock: No permitir ventas si la cantidad solicitada excede el stock disponible.
- RF3.7: Validación de precios: Precios de venta y costo deben ser positivos, y precio de venta debe ser mayor que costo.
- RF3.8: Gestión de códigos duplicados: Alertar al owner si intenta crear un producto con código de barras ya existente.

**Nota sobre Recepción de Mercancía (para MVP):** Limitada a ajustes manuales por owner (e.g., botón "Agregar stock" en producto). Automatización completa (e.g., pedidos a proveedores) en futuras versiones.

### 4.4 Scanner/Ventas
- RF4.1: Integración de scanner: Uso de cámara web o Bluetooth para escanear códigos de barras; agrega al carrito automáticamente.  
- RF4.2: Carrito de ventas: Acumula productos escaneados/manuales; calcula subtotal, impuestos (configurable, e.g., IVA%), total.  
- RF4.3: Procesamiento de pagos: Soporte básico para efectivo (ingreso de monto recibido, cálculo de cambio) y una pasarela digital simple (e.g., Stripe para tarjetas). Al confirmar pago exitoso, actualiza stock en el servidor; cambios visibles al refrescar la página.  
- RF4.4: Confirmación y recibo: Genera PDF/digital con detalles de venta; opción para email o impresión.  
- RF4.5: Devoluciones básicas: Revertir venta reciente, sumando stock de vuelta en el servidor; cambios visibles al refrescar la página.
- RF4.6: Validación de productos: Verificar que el producto existe antes de agregarlo al carrito de ventas.
- RF4.7: Manejo de errores de venta: Si falla el procesamiento de la venta, revertir automáticamente los cambios en stock.
- RF4.8: Creación de productos desde scanner: Si un código de barras escaneado no existe, ofrecer opción de crear producto nuevo.

### 4.5 Configuración de Tienda
- RF5.1: Datos básicos de tienda: Configuración de nombre, dirección, teléfono y datos de contacto.
- RF5.2: Configuración de moneda: Selección de moneda local y formato de precios.
- RF5.3: Configuración de impuestos: Establecer porcentajes de IVA y otros impuestos aplicables.
- RF5.4: Configuración de alertas: Nivel mínimo de stock configurable para alertas automáticas.

### 4.6 Auditoría y Logging
- RF6.1: Registro de ventas: Registrar quién realizó cada venta, cuándo y qué productos se vendieron.
- RF6.2: Registro de cambios de inventario: Registrar quién modificó el stock de cada producto y cuándo.
- RF6.3: Logs de errores del sistema: Registrar errores críticos para facilitar el debugging.
- RF6.4: Historial de cambios de productos: Registrar modificaciones en datos de productos.

### 4.7 Manejo de Errores y Recuperación
- RF7.1: Validación de datos de entrada: Verificar que todos los datos ingresados cumplan con los formatos requeridos.
- RF7.2: Manejo de fallos de red: Gestionar interrupciones de conexión durante operaciones críticas.
- RF7.3: Recuperación de transacciones fallidas: Restaurar el estado anterior si una operación falla a mitad de proceso.
- RF7.4: Backup de datos críticos: Respaldo automático de información importante del negocio.
- RF7.5: Manejo de errores de autenticación: Gestionar tokens expirados, credenciales inválidas y intentos de acceso no autorizado.
- RF7.6: Manejo de errores de scanner: Gestionar fallos de cámara, códigos de barras ilegibles o no reconocidos.
- RF7.7: Manejo de errores de pago: Gestionar fallos en procesamiento de pagos, tarjetas rechazadas y problemas de conectividad con pasarelas.
- RF7.8: Manejo de errores de base de datos: Gestionar fallos de conexión, timeouts y errores de consulta.
- RF7.9: Manejo de errores de email: Gestionar fallos en envío de invitaciones y notificaciones por correo.
- RF7.10: Manejo de errores de permisos: Gestionar intentos de acceso a funcionalidades no autorizadas según el rol del usuario.
- RF7.11: Manejo de errores de validación: Gestionar datos inválidos, campos requeridos vacíos y formatos incorrectos.
- RF7.12: Manejo de errores de concurrencia: Gestionar conflictos cuando múltiples usuarios intentan modificar el mismo dato simultáneamente.
- RF7.13: Manejo de errores de memoria: Gestionar limitaciones de memoria en dispositivos con recursos limitados.
- RF7.14: Manejo de errores de navegador: Gestionar incompatibilidades con navegadores antiguos o no soportados.
- RF7.15: Manejo de errores de archivos: Gestionar fallos en generación de PDFs, impresión de recibos y descarga de reportes.

## 5. Requisitos No Funcionales

- Usabilidad: Interfaz intuitiva (e.g., Material UI); responsive para mobile/desktop.  
- Rendimiento: Actualizaciones al refrescar la página; carga < 3s.  
- Seguridad: Encriptación HTTPS; datos sensibles hashed (e.g., contraseñas con bcrypt); protección contra SQL injection/XSS.  
- Escalabilidad: Soporte inicial para 1-50 usuarios por tienda; base de datos cloud (e.g., Firebase).  
- Accesibilidad: Cumplir WCAG básicas (e.g., alt text en imágenes).  
- Idioma: Español por defecto; soporte para inglés en futuro.
- Validación: Validación de datos tanto en frontend como en backend para prevenir errores.
- Backup: Respaldo automático diario de datos críticos del negocio.
- Logging: Registro de operaciones importantes para auditoría y debugging.
- Concurrencia: Manejo básico de múltiples usuarios trabajando simultáneamente.
- Tolerancia a fallos: El sistema debe continuar funcionando aunque algunos servicios externos fallen.
- Recuperación: Capacidad de recuperar datos y operaciones después de fallos del sistema.

## 6. Flujos de Usuario (User Flows)

### 6.1 Flujo de Onboarding para Owner
- Registro → Verificación email → Crear tienda → Dashboard inicial.  
- Invitar empleado → Empleado acepta → Asignar rol.

### 6.2 Flujo de Venta para Empleado
- Login → Seleccionar "Nueva Venta" → Escanear/agregar productos → Ver total → Seleccionar pago → Confirmar → Recibo generado, stock actualizado en servidor (refrescar para ver cambios).

### 6.3 Flujo de Inventario para Owner
- Login → Ir a "Inventario" → Agregar producto → Ver lista → Editar stock manualmente (refrescar para ver actualizaciones).

## 7. Consideraciones Técnicas

### Stack Sugerido
- Frontend: React.js (con Hooks para estado); Tailwind CSS para estilos.  
- Backend: Node.js/Express.  
- DB: MongoDB o PostgreSQL para almacenamiento persistente.  
- Auth: Firebase Auth o JWT con Passport.js.  
- Scanner: Biblioteca como QuaggaJS para escaneo vía cámara.  
- Pagos: Integración Stripe (SDK para Node.js).

Dependencias: Acceso a email service (e.g., SendGrid); API keys para pagos.  
Testing: Unit tests para auth/ventas; pruebas E2E con Cypress.

## 8. Asunciones y Riesgos

### Asunciones
- Usuarios tienen acceso a internet estable; dispositivos con cámara para scanner.
- Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+).
- Dispositivos con al menos 2GB RAM para funcionamiento óptimo.
- Conexión a internet estable (mínimo 1 Mbps).

### Riesgos
- Integración de pagos puede requerir compliance (e.g., PCI); posibles inconsistencias temporales en datos hasta refrescar la página.  
- Dependencias Externas: Pasarelas de pago; servicios cloud.
- Pérdida de datos por fallos de red o del servidor.
- Conflictos si múltiples usuarios editan el mismo producto simultáneamente.
- Códigos de barras duplicados o inválidos que pueden causar errores en el scanner.
- Fallos en servicios externos (email, pagos) que pueden interrumpir operaciones críticas.
- Errores de hardware (cámara, impresora) que pueden afectar el flujo de trabajo.
- Problemas de compatibilidad con dispositivos antiguos o navegadores no soportados.

## 9. Roadmap Post-MVP

- Iteración 2: Reportes básicos, integración proveedores.  
- Iteración 3: Notificaciones, modo offline, analíticas.