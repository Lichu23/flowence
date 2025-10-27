## Qué testear (Sprint 3.2)

### POS y RBAC

Verifica que un empleado, al iniciar sesión, sea redirigido automáticamente a /pos y que se le bloquee el acceso a /dashboard mediante la navegación directa o por URL.

Verifica que un owner sea redirigido a /dashboard al iniciar sesión y que no pueda acceder a /pos ni por navegación ni ingresando la URL manualmente.

### Búsqueda y escaneo

Abre el modal del escáner, confirma que la cámara inicia correctamente, cierra el modal y vuelve a abrirlo; al detectar un producto, se debe agregar una sola vez al carrito sin generar duplicados ni loops de re-render.

Escribe en la búsqueda manual y espera el debounce; verifica que aparezcan resultados, selecciona un producto desde la lista, se agrega al carrito y los resultados se limpian correctamente.

### Carrito

Agrega un producto al carrito y prueba incrementar y decrementar cantidades; elimina un ítem y confirma que el carrito y los totales se actualicen de forma inmediata.

Intenta superar el límite disponible de stock_venta al incrementar cantidades y valida que se muestre un mensaje de error y no se permita el incremento.

Valida los totales del carrito: el subtotal, el impuesto calculado según currentStore.tax_rate y el total final con redondeo a 2 decimales.

### Pago (cash)

Abre el modal de pago, ingresa el monto recibido y verifica el cálculo de cambio; el botón “Confirmar” debe permanecer deshabilitado si el monto recibido es menor al total.

Confirma la venta desde el modal; la operación debe llamar al endpoint, mostrar un toast de éxito y vaciar el carrito al finalizar correctamente.

### API ventas

Ejecuta un POST a /api/stores/:storeId/sales y verifica respuesta 201 con el objeto sale y receipt_number.

Ejecuta un GET a /api/stores/:storeId/sales y valida la lista paginada junto a los filtros payment_method, payment_status y el rango de fechas start_date y end_date.

Ejecuta un GET a /api/stores/:storeId/sales/:saleId y valida que devuelva el detalle con sus items asociados.

Valida RBAC en historial y detalle: un empleado solo debe ver sus propias ventas, mientras que el owner ve todas; si el empleado intenta acceder al detalle de otra venta, debe recibir 403.

### Efectos en inventario y auditoría

Confirma que la venta descuente stock_venta por defecto y que, si se envía stock_type='deposito', el descuento suceda en stock_deposito.

Verifica que se actualice products.stock (compatibilidad) como la suma de stock_venta y stock_deposito tras la venta.

Comprueba que se genere un registro en stock_movements con movement_type='sale', los valores quantity_before y quantity_after correctos, performed_by con el usuario que vendió y reason con el número de recibo.

### Validaciones y errores

Intenta crear una venta sin items y verifica que retorne 400 indicando el problema.

Intenta vender un producto inactivo o inexistente y verifica que retorne 400 con un mensaje claro.

Intenta procesar una venta con stock insuficiente y confirma que retorne 400 con el detalle del error.

Valida el cálculo de totales: el impuesto debe aplicarse sobre (subtotal - descuentos) y el receipt_number debe ser único por tienda y año.

### Configuración y conectividad

Configura NEXT_PUBLIC_API_URL apuntando al backend y confirma que ya no aparezcan 404 al realizar POST de ventas ni en el login.

Verifica que las llamadas utilicen apiRequest con manejo de refresh token y que no se queden sin autenticación durante la sesión.

### Base de datos

Comprueba que estén aplicadas las migraciones para sales y sale_items (incluyen receipt_number y discount), stock_movements y las columnas de dual stock en products.

Asegura que no existan errores por columnas faltantes en tiempo de ejecución, especialmente receipt_number y discount.

## Qué falta para completar el sprint

Configurar NEXT_PUBLIC_API_URL en el frontend para evitar 404 en ventas y login en todos los entornos locales.

Persistir el carrito en localStorage para evitar su pérdida en caso de recarga de la página o cierre accidental del modal.

Unificar los toasts de éxito y error en el POS para una experiencia consistente y clara.

Confirmar en la base de datos la existencia de sales.receipt_number, sales.discount, stock_movements y products.stock_venta / products.stock_deposito, y aplicar las migraciones faltantes si corresponde.

Documentar brevemente el checklist de pruebas ejecutadas y los resultados obtenidos para cierre del sprint.

Opcionalmente, implementar la UI de historial y detalle de ventas en el frontend con lista paginada y vista de detalle.