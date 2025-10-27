# 🧪 Frontend Testing Checklist - Sprint 2.1: Sistema de Invitaciones

## ✅ Estado de la Implementación Frontend

### **Completado:**
- ✅ Tipos TypeScript para invitaciones (`types/index.ts`)
- ✅ API client completo (`lib/api.ts`)
- ✅ Página de gestión de empleados (`/employees`)
- ✅ Página de aceptar invitaciones (`/accept-invitation`)
- ✅ Integración con contextos de Auth y Store

### **Pendiente:**
- ❌ Integración de SendGrid (emails no se envían realmente)
- ❌ Notificaciones push/toast
- ❌ Tests automatizados

---

## 🎯 Pre-requisitos para Testing

### **1. Backend Running**
```bash
cd server
npm run dev
# Servidor corriendo en http://localhost:3001
```

### **2. Frontend Running**
```bash
cd flowence-client
npm run dev
# Cliente corriendo en http://localhost:3000
```

### **3. Datos de Prueba**
- ✅ Usuario Owner registrado
- ✅ Tienda creada
- ✅ Token de autenticación válido

---

## 📱 Checklist de Funcionalidad Frontend

### **FLUJO 1: Acceso a Gestión de Empleados**

#### **Test 1.1: Navegación desde Dashboard**
- [ ] **Desde Dashboard:** Verificar que existe enlace/botón a "Empleados" o "Gestión de Empleados"
- [ ] **URL Correcta:** Al hacer clic, navega a `/employees`
- [ ] **Protección de Ruta:** Solo usuarios autenticados pueden acceder
- [ ] **Carga de Página:** La página carga sin errores de consola

#### **Test 1.2: Header y Navegación**
- [ ] **Logo Flowence:** Visible y funcional (redirige a dashboard)
- [ ] **StoreSelector:** Muestra las tiendas del usuario
- [ ] **User Info:** Muestra nombre y rol del usuario
- [ ] **Botón Logout:** Funciona correctamente
- [ ] **Breadcrumbs:** Enlaces de navegación funcionan

#### **Test 1.3: Validación de Permisos**
- [ ] **Owner:** Ve botón "Invitar Empleado"
- [ ] **Employee:** NO ve botón "Invitar Empleado"
- [ ] **Sin Tienda:** Muestra mensaje de seleccionar tienda

---

### **FLUJO 2: Enviar Invitaciones**

#### **Test 2.1: Modal de Invitación**
- [ ] **Abrir Modal:** Botón "Invitar Empleado" abre el modal
- [ ] **Diseño UI:** Modal se ve correctamente centrado
- [ ] **Campos Requeridos:** Email marcado como requerido (*)
- [ ] **Cerrar Modal:** Botón X y Cancelar cierran el modal
- [ ] **Fondo Oscuro:** Background overlay visible

#### **Test 2.2: Validación de Formulario**
- [ ] **Email Vacío:** Muestra error si se envía sin email
- [ ] **Email Inválido:** Valida formato de email
- [ ] **Email Válido:** Acepta emails correctos
- [ ] **Placeholder:** Texto de ayuda visible

#### **Test 2.3: Envío de Invitación**
- [ ] **Loading State:** Botón cambia a "Enviando..." 
- [ ] **Botón Deshabilitado:** Se deshabilita durante el envío
- [ ] **Respuesta Exitosa:** Muestra mensaje de éxito
- [ ] **URL de Invitación:** Se muestra la URL generada
- [ ] **Modal se Cierra:** Se cierra automáticamente tras éxito
- [ ] **Lista se Actualiza:** Se recarga la lista de invitaciones

#### **Test 2.4: Manejo de Errores**
- [ ] **Error de Red:** Muestra mensaje de error apropiado
- [ ] **Email Duplicado:** Maneja error de invitación duplicada
- [ ] **Sin Permisos:** Maneja error de autorización
- [ ] **Modal Permanece:** Modal no se cierra en caso de error

---

### **FLUJO 3: Lista de Invitaciones**

#### **Test 3.1: Carga de Lista**
- [ ] **Loading State:** Muestra spinner mientras carga
- [ ] **Lista Vacía:** Mensaje "No hay invitaciones aún"
- [ ] **Lista Poblada:** Muestra todas las invitaciones
- [ ] **Error de Carga:** Maneja errores de API apropiadamente

#### **Test 3.2: Columnas de la Tabla**
- [ ] **Email:** Se muestra correctamente
- [ ] **Rol:** Se muestra correctamente (employee/owner)
- [ ] **Estado:** Badge con color apropiado
- [ ] **Fecha Creación:** Formato legible
- [ ] **Fecha Expiración:** Formato legible
- [ ] **Acciones:** Botones cuando aplique

#### **Test 3.3: Estados Visuales**
- [ ] **Pending:** Badge amarillo
- [ ] **Accepted:** Badge verde
- [ ] **Expired:** Badge gris
- [ ] **Revoked:** Badge rojo
- [ ] **Responsive:** Tabla se adapta a pantalla pequeña

#### **Test 3.4: Acciones en Lista**
- [ ] **Reenviar:** Solo visible para invitaciones pending
- [ ] **Revocar:** Solo visible para invitaciones pending
- [ ] **Sin Acciones:** No muestra botones para accepted/expired/revoked
- [ ] **Solo Owner:** Empleados no ven botones de acción

---

### **FLUJO 4: Gestión de Invitaciones**

#### **Test 4.1: Reenviar Invitación**
- [ ] **Botón Visible:** Solo para status "pending"
- [ ] **Confirmación:** Se ejecuta al hacer clic
- [ ] **Loading State:** Muestra algún indicador de carga
- [ ] **Respuesta Exitosa:** Muestra nueva URL de invitación
- [ ] **Alert/Modal:** Se muestra mensaje con nueva URL
- [ ] **Lista se Actualiza:** No cambia status (sigue pending)

#### **Test 4.2: Revocar Invitación**
- [ ] **Botón Visible:** Solo para status "pending"
- [ ] **Confirmación:** Muestra dialog de confirmación
- [ ] **Cancelar:** Permite cancelar la operación
- [ ] **Confirmar:** Ejecuta la revocación
- [ ] **Loading State:** Muestra indicador durante proceso
- [ ] **Lista se Actualiza:** Status cambia a "revoked"

#### **Test 4.3: Mensajes de Éxito**
- [ ] **Mensaje Visible:** Banner verde para operaciones exitosas
- [ ] **Contenido Correcto:** Incluye URL de invitación cuando aplique
- [ ] **Auto-dismiss:** Se oculta automáticamente o manualmente
- [ ] **No Duplicados:** No se acumulan múltiples mensajes

---

### **FLUJO 5: Página de Aceptar Invitación**

#### **Test 5.1: Acceso a la Página**
- [ ] **URL Correcta:** `/accept-invitation?token=ABC123`
- [ ] **Sin Token:** Muestra error "Token no proporcionado"
- [ ] **Token Inválido:** Muestra mensaje de invitación inválida
- [ ] **Loading:** Muestra spinner durante validación

#### **Test 5.2: Validación de Token**
- [ ] **Token Válido:** Muestra información de la invitación
- [ ] **Token Expirado:** Muestra mensaje de expiración
- [ ] **Token Revocado:** Muestra mensaje apropiado
- [ ] **Token Inexistente:** Maneja error correctamente

#### **Test 5.3: Información de Invitación**
- [ ] **Nombre de Tienda:** Se muestra correctamente
- [ ] **Email del Invitado:** Se muestra correctamente
- [ ] **Rol:** Se muestra correctamente
- [ ] **Diseño:** Banner azul con información clara

#### **Test 5.4: Formulario de Registro**
- [ ] **Campo Nombre:** Requerido y funcional
- [ ] **Campo Contraseña:** Requerido, tipo password
- [ ] **Confirmar Contraseña:** Requerido, validación de coincidencia
- [ ] **Validación Mínima:** Al menos 8 caracteres
- [ ] **Placeholder:** Textos de ayuda apropiados

#### **Test 5.5: Validaciones del Formulario**
- [ ] **Nombre Vacío:** Muestra error
- [ ] **Contraseña Corta:** Error "mínimo 8 caracteres"
- [ ] **Contraseñas No Coinciden:** Error específico
- [ ] **Campos Válidos:** Permite envío

#### **Test 5.6: Proceso de Registro**
- [ ] **Loading State:** Botón cambia a "Creando cuenta..."
- [ ] **Botón Deshabilitado:** Durante el proceso
- [ ] **Registro Exitoso:** Guarda token en localStorage
- [ ] **Redirección:** Navega a `/dashboard`
- [ ] **Auto-login:** Usuario queda autenticado

#### **Test 5.7: Manejo de Errores**
- [ ] **Token Inválido:** Error apropiado
- [ ] **Token Expirado:** Error durante registro
- [ ] **Email Existente:** Maneja usuario ya registrado
- [ ] **Error de Red:** Mensaje de error genérico

---

### **FLUJO 6: Integración con Contextos**

#### **Test 6.1: AuthContext**
- [ ] **Estado Loading:** Se refleja correctamente
- [ ] **Usuario Logueado:** Información disponible
- [ ] **Logout:** Funciona desde cualquier página
- [ ] **Token Management:** Se maneja automáticamente

#### **Test 6.2: StoreContext**
- [ ] **Store Actual:** Se mantiene selección
- [ ] **Cambio de Store:** Actualiza lista de invitaciones
- [ ] **Sin Store:** Muestra mensaje apropiado
- [ ] **Permisos:** Se validan correctamente

---

### **FLUJO 7: Navegación y UX**

#### **Test 7.1: Responsive Design**
- [ ] **Desktop:** Layout correcto en pantallas grandes
- [ ] **Tablet:** Se adapta correctamente
- [ ] **Mobile:** Funcional en móviles
- [ ] **Tabla:** Scroll horizontal en pantallas pequeñas

#### **Test 7.2: Estados de Carga**
- [ ] **Spinners:** Visibles durante operaciones async
- [ ] **Botones Deshabilitados:** Durante operaciones
- [ ] **Mensajes de Estado:** Claros y útiles
- [ ] **No Parpadeos:** Transiciones suaves

#### **Test 7.3: Accesibilidad**
- [ ] **Labels:** Todos los inputs tienen labels
- [ ] **Focus:** Navegación por teclado funciona
- [ ] **Contrast:** Colores tienen suficiente contraste
- [ ] **ARIA:** Atributos apropiados donde necesario

---

## 🔧 Tests de Integración End-to-End

### **Escenario Completo: Invitación de Empleado**

#### **Preparación:**
1. [ ] Login como Owner
2. [ ] Navegar a /employees
3. [ ] Verificar que lista está vacía o con invitaciones previas

#### **Paso 1: Enviar Invitación**
1. [ ] Hacer clic en "Invitar Empleado"
2. [ ] Llenar email: `empleado@test.com`
3. [ ] Hacer clic en "Enviar Invitación"
4. [ ] Verificar mensaje de éxito con URL
5. [ ] Verificar que modal se cierra
6. [ ] Verificar nueva invitación en lista con status "pending"

#### **Paso 2: Copiar URL de Invitación**
1. [ ] Copiar URL del mensaje de éxito
2. [ ] URL debe tener formato: `http://localhost:3000/accept-invitation?token=ABC123`

#### **Paso 3: Aceptar Invitación (Nueva Ventana/Incógnito)**
1. [ ] Abrir URL en nueva ventana incógnito
2. [ ] Verificar que página de aceptación carga
3. [ ] Verificar información de la tienda se muestra
4. [ ] Llenar formulario:
   - Nombre: "Empleado Test"
   - Contraseña: "Password123"
   - Confirmar: "Password123"
5. [ ] Hacer clic en "Crear Cuenta y Aceptar"
6. [ ] Verificar redirección a /dashboard
7. [ ] Verificar que usuario está logueado como employee

#### **Paso 4: Verificar en Lista (Ventana Original)**
1. [ ] Actualizar página de empleados
2. [ ] Verificar que invitación cambió a status "accepted"
3. [ ] Verificar que no hay botones de acción para esta invitación

---

## 🚫 Tests de Casos Edge y Errores

### **Test E1: Invitaciones Duplicadas**
1. [ ] Enviar invitación a `test@example.com`
2. [ ] Enviar otra invitación al mismo email
3. [ ] Verificar que la primera se revoca automáticamente
4. [ ] Verificar que la nueva aparece como pending

### **Test E2: Tokens Inválidos**
1. [ ] Ir a `/accept-invitation?token=invalid123`
2. [ ] Verificar mensaje de error apropiado
3. [ ] Verificar enlace de "Ir al Login"

### **Test E3: Permisos de Employee**
1. [ ] Login como employee
2. [ ] Ir a `/employees`
3. [ ] Verificar que NO ve botón "Invitar Empleado"
4. [ ] Verificar que NO ve botones de acciones en lista

### **Test E4: Sin Conexión Backend**
1. [ ] Detener servidor backend
2. [ ] Intentar enviar invitación
3. [ ] Verificar mensaje de error de conexión
4. [ ] Verificar que UI no se rompe

### **Test E5: Validaciones de Contraseña**
1. [ ] Ir a página de aceptar invitación válida
2. [ ] Intentar contraseña de 7 caracteres
3. [ ] Verificar error "mínimo 8 caracteres"
4. [ ] Intentar contraseñas que no coinciden
5. [ ] Verificar error "contraseñas no coinciden"

---

## 📊 Checklist de Calidad de Código

### **TypeScript**
- [ ] **Sin Errores:** `npm run type-check` pasa sin errores
- [ ] **Tipos Correctos:** Todos los props tienen tipos definidos
- [ ] **Interfaces:** Se usan interfaces del archivo types/index.ts
- [ ] **Any Types:** No hay tipos `any` innecesarios

### **React Best Practices**
- [ ] **Functional Components:** Se usan componentes funcionales
- [ ] **Hooks Correctos:** useEffect, useState usados apropiadamente
- [ ] **Key Props:** Todas las listas tienen keys únicas
- [ ] **Event Handlers:** Manejadores de eventos correctos

### **Performance**
- [ ] **Re-renders:** No hay re-renders innecesarios
- [ ] **useCallback:** Se usa para funciones que se pasan como props
- [ ] **useMemo:** Se usa para cálculos costosos si los hay
- [ ] **Loading States:** No hay estados de carga que bloqueen UI

### **Accessibility**
- [ ] **Keyboard Navigation:** Funciona con Tab/Enter
- [ ] **Screen Readers:** Labels apropiados
- [ ] **Focus Management:** Focus visible y lógico
- [ ] **Color Blindness:** No depende solo de colores

---

## 🎯 Resultados Esperados

### **✅ Funcionalidad Completa**
- Owners pueden enviar invitaciones desde la UI
- Las invitaciones se muestran en lista con toda la información
- Se pueden reenviar y revocar invitaciones
- Empleados pueden aceptar invitaciones y crear cuentas
- La integración con el backend funciona perfectamente

### **✅ UX Excelente**
- Todas las operaciones tienen feedback visual
- Los estados de carga son claros
- Los errores se manejan elegantemente
- La navegación es intuitiva
- El diseño es responsive y accesible

### **✅ Código de Calidad**
- TypeScript sin errores
- Componentes bien estructurados
- Buena separación de responsabilidades
- Tests pasan (cuando se implementen)

---

## 🚨 Red Flags a Verificar

### **Errores Críticos**
- [ ] **Console Errors:** No hay errores de JavaScript en consola
- [ ] **Network Errors:** Requests a API funcionan correctamente
- [ ] **Type Errors:** No hay errores de TypeScript
- [ ] **Memory Leaks:** No hay listeners sin limpiar

### **UX Issues**
- [ ] **Loading Infinito:** Ningún loading state se queda colgado
- [ ] **Botones Rotos:** Todos los botones responden al clic
- [ ] **Formularios:** Todos los campos funcionan correctamente
- [ ] **Navegación:** No hay rutas rotas

### **Security Issues**
- [ ] **Token Storage:** Tokens se guardan de forma segura
- [ ] **Validation:** Validaciones cliente-lado no son la única seguridad
- [ ] **XSS:** No hay inserción de HTML sin sanitizar
- [ ] **CSRF:** Requests incluyen tokens apropiados

---

## 🎉 Criterios de Éxito

### **Sprint 2.1 Considerado EXITOSO cuando:**

✅ **Funcionalidad Core (100%)**
- Owner puede enviar invitaciones ✓
- Empleados pueden aceptar invitaciones ✓
- Lista de invitaciones funciona completamente ✓
- Gestión (reenviar/revocar) funciona ✓

✅ **Integración Backend (100%)**
- Todas las APIs funcionan correctamente ✓
- Manejo de errores apropiado ✓
- Estados de la aplicación consistentes ✓

✅ **UX/UI (90%)**
- Interfaz intuitiva y atractiva ✓
- Estados de carga claros ✓
- Mensajes de error útiles ✓
- Responsive design ✓

✅ **Calidad Técnica (95%)**
- Código TypeScript sin errores ✓
- Componentes bien estructurados ✓
- Performance aceptable ✓
- Accesibilidad básica ✓

---

## 🔄 Siguiente Fase

### **Una vez completado este checklist:**
1. **Documentar Issues:** Crear lista de bugs encontrados
2. **Priorizar Fixes:** Clasificar por severidad
3. **Performance Review:** Medir tiempos de carga
4. **User Testing:** Probar con usuarios reales
5. **Sprint 2.2:** Planificar siguientes funcionalidades

---

**¡Sprint 2.1 Frontend Testing Complete! 🚀**

