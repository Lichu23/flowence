1. Endpoint de Búsqueda por Código de Barras
GET /api/stores/:storeId/products/search/barcode/:code
✅ Tests Básicos:
[ ] Producto Encontrado: Buscar un código existente → Debe devolver el producto
[ ] Producto No Encontrado: Buscar código inexistente → Error 404 "PRODUCT_NOT_FOUND"
[ ] Código Inválido: Buscar "abc123" → Error 400 "INVALID_BARCODE_FORMAT"
[ ] Código Muy Corto: Buscar "123" → Error 400 (menos de 8 dígitos)
[ ] Código Muy Largo: Buscar "123456789012345" → Error 400 (más de 14 dígitos)
✅ Tests de Autenticación:
[ ] Sin Token: Request sin Authorization → Error 401
[ ] Token Inválido: Token corrupto → Error 401
[ ] Sin Acceso a Tienda: Usuario sin permisos → Error 403
✅ Tests por Rol:
[ ] Owner: Debe poder buscar productos
[ ] Employee: Debe poder buscar productos
[ ] Diferentes Tiendas: Producto solo visible en su tienda
2. Endpoint de Validación de Códigos
GET /api/stores/:storeId/products/barcode/:code/validate
✅ Tests de Unicidad:
[ ] Código Único: Nuevo código → isUnique: true
[ ] Código Duplicado: Código existente → isUnique: false + existingProduct
[ ] Edición: Mismo código del producto editado → isUnique: true
📱 Frontend Component Tests
3. Componente BarcodeScanner
✅ Funcionalidad Core:
[ ] Inicialización: Scanner inicia correctamente con QuaggaJS
[ ] Detección: Scanner detecta códigos de barras válidos
[ ] Callback: onDetected se ejecuta con código correcto
[ ] Error de Cámara: Manejo cuando cámara no disponible
[ ] Permisos Denegados: UI de error cuando usuario niega cámara
✅ Estados del Scanner:
[ ] Estado Loading: Muestra "Initializing..." durante setup
[ ] Estado Active: Muestra "Scanning..." cuando funcional
[ ] Estado Error: Muestra mensaje de error apropiado
[ ] Overlay Visual: Marcos de guía y línea roja visibles
4. Componente ManualEntry
✅ Entrada Manual:
[ ] Input Numérico: Solo acepta números (0-9)
[ ] Validación Longitud: Error si menos de 8 o más de 14 dígitos
[ ] Submit: Ejecuta callback con código válido
[ ] Clear: Limpia input después de submit exitoso
[ ] Escape: Cierra modal con tecla ESC
5. Componente ScannerModal
✅ Modal Behavior:
[ ] Apertura: Modal se abre al hacer clic en botón
[ ] Cierre: Modal se cierra con X o backdrop click
[ ] Toggle Modes: Cambia entre Scanner y Manual correctamente
[ ] Auto-switch: Cambia a Manual cuando Scanner falla
[ ] Loading State: Muestra spinner durante búsqueda
6. Hook useBarcodeSearch
✅ API Integration:
[ ] Search Success: Retorna producto cuando encontrado
[ ] Search Failure: Maneja error cuando no encontrado
[ ] Loading State: loading: true durante request
[ ] Error Handling: Mapea errores de API a mensajes user-friendly
[ ] Clear Results: Resetea estado correctamente
🖥️ Integration Tests
7. Integración en Página de Productos
✅ UI Integration:
[ ] Botón Visible: Botón "Escanear" aparece junto a barra de búsqueda
[ ] Modal Trigger: Click abre ScannerModal correctamente
[ ] Product Found: Producto escaneado aparece en lista
[ ] Filters Clear: Filtros se limpian cuando producto encontrado
[ ] Responsive: Botón se adapta en mobile (solo ícono)
✅ Workflow Completo:
[ ] Scan → Find → Show: Flujo completo funciona
[ ] Multiple Scans: Puede escanear múltiples productos seguidos
[ ] Context Preserved: Estado de página se mantiene
📱 Mobile & Responsive Tests
8. Dispositivos Móviles
✅ Mobile Browser Testing:
[ ] iOS Safari: Scanner funciona en iPhone/iPad
[ ] Android Chrome: Scanner funciona en Android
[ ] Camera Access: Permissions request apropiado
[ ] Performance: No lag o crashes en dispositivos lentos
✅ Responsive Design:
[ ] Mobile Portrait: Modal full-screen, controles táctiles
[ ] Mobile Landscape: Layout se adapta correctamente
[ ] Tablet: Tamaño intermedio, experiencia optimizada
[ ] Desktop: Modal centrado, teclado shortcuts
9. Camera & Hardware Tests
✅ Camera Behavior:
[ ] Front Camera: Funciona si solo hay cámara frontal
[ ] Back Camera: Prefiere cámara trasera por defecto
[ ] No Camera: Fallback a manual entry automático
[ ] Multiple Cameras: Selecciona cámara correcta
🔄 Error Handling Tests
10. Escenarios de Error
✅ Network Errors:
[ ] Connection Lost: Manejo cuando se pierde internet
[ ] Server Down: Error 500 manejado apropiadamente
[ ] Timeout: Request timeout manejado
[ ] Rate Limited: Error 429 con mensaje claro
✅ Hardware Errors:
[ ] Camera Busy: Otra app usando cámara
[ ] Camera Error: Hardware malfunction
[ ] Low Light: Scanner funciona en condiciones de poca luz
[ ] Barcode Quality: Maneja códigos borrosos o dañados
🎯 User Acceptance Tests
11. Flujos de Usuario Real
✅ Empleado Típico:
[ ] Scenario 1: Escanear producto existente para verificar stock
[ ] Scenario 2: Intentar escanear producto nuevo (no encontrado)
[ ] Scenario 3: Scanner falla → usar entrada manual
[ ] Scenario 4: Buscar múltiples productos consecutivamente
✅ Owner Típico:
[ ] Scenario 1: Verificar productos durante inventario
[ ] Scenario 2: Buscar producto para editar información
[ ] Scenario 3: Usar en tablet durante recepción de mercancía
⚡ Performance Tests
12. Performance & UX
✅ Speed Tests:
[ ] Scanner Init: Menos de 2 segundos para inicializar
[ ] Detection Speed: Detecta código en menos de 1 segundo
[ ] API Response: Búsqueda en menos de 500ms
[ ] Modal Animation: Transiciones fluidas sin lag
✅ Memory & Resources:
[ ] Memory Usage: No memory leaks en uso prolongado
[ ] Battery Impact: Uso razonable de batería en mobile
[ ] CPU Usage: No consume excesivo CPU
🔐 Security Tests
13. Security Validation
✅ Input Validation:
[ ] SQL Injection: Códigos maliciosos no afectan BD
[ ] XSS Prevention: Input sanitizado correctamente
[ ] Parameter Tampering: Store ID validation funciona
📋 Checklist Final
✅ Tests Críticos (Debe pasar 100%)
[ ] Scanner detecta códigos EAN-13 estándar
[ ] Entrada manual funciona como fallback
[ ] Productos encontrados se muestran correctamente
[ ] Modal responsive en mobile y desktop
[ ] API devuelve errores apropiados
[ ] Autenticación y permisos funcionan
⚠️ Tests Opcionales (Mejorarían UX)
[ ] Scanner funciona con códigos dañados
[ ] Performance óptima en dispositivos lentos
[ ] Funciona offline (con productos cached)