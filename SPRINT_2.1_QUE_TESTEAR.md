# 🧪 Sprint 2.1: ¿QUÉ TESTEAR?

## ✅ Sistema de Invitaciones - Completado

---

## 🚀 Inicio Rápido

### **1. Iniciar Ambos Servidores**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd flowence-client
npm run dev
```

Esperar a que ambos estén corriendo:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

---

## 🎯 Flujo de Testeo Completo (10 minutos)

### **Paso 1: Registrar un Owner** ✅

1. Ir a `http://localhost:3000/register`
2. Llenar el formulario:
   - Nombre: `Test Owner`
   - Email: `owner@test.com`
   - Contraseña: `Owner123!@#`
   - Store Name: `Mi Tienda de Prueba`
   - Store Address: `Calle Principal 123`
   - Store Phone: `+1234567890`
3. Click "Create Account"
4. **Verificar:** Redirección al Dashboard

---

### **Paso 2: Ir a Gestión de Empleados** ✅

1. En el Dashboard, click en el enlace **"Empleados"** en el header
2. **Verificar:** 
   - La página carga correctamente
   - Se muestra "Gestión de Empleados"
   - Hay un botón "+ Invitar Empleado"
   - La tabla está vacía (sin invitaciones aún)

---

### **Paso 3: Enviar una Invitación** ✅

1. Click en **"Invitar Empleado"**
2. En el modal, ingresar email: `empleado1@test.com`
3. Click **"Enviar Invitación"**
4. **Verificar:**
   - Se cierra el modal
   - Aparece mensaje de éxito con la URL de invitación
   - La tabla ahora muestra la invitación con:
     - ✉️ Email: `empleado1@test.com`
     - 👤 Rol: `employee`
     - 🟡 Estado: `pending` (badge amarillo)
     - 📅 Fecha de creación: hoy
     - ⏰ Expira: en 7 días
     - Botones: "Reenviar" y "Revocar"

5. **Copiar la URL de invitación** que aparece en el mensaje de éxito

---

### **Paso 4: Aceptar la Invitación** ✅

1. **Abrir una ventana de incógnito** (o cerrar sesión)
2. Pegar la URL de invitación (similar a):
   ```
   http://localhost:3000/accept-invitation?token=abc123def456...
   ```
3. **Verificar que la página muestra:**
   - ✅ "Has sido invitado a: Mi Tienda de Prueba"
   - ✅ Email: `empleado1@test.com`
   - ✅ Rol: `employee`

4. Llenar el formulario:
   - Tu Nombre: `Juan Empleado`
   - Contraseña: `Employee123!@#`
   - Confirmar: `Employee123!@#`

5. Click **"Crear Cuenta y Aceptar"**

6. **Verificar:**
   - ✅ Redirección automática al Dashboard
   - ✅ Usuario logueado como empleado
   - ✅ En el header dice: "Juan Empleado (employee)"
   - ✅ El selector de tiendas muestra "Mi Tienda de Prueba"

---

### **Paso 5: Verificar Invitación Aceptada** ✅

1. **Volver a la ventana del Owner** (o hacer login como owner)
2. Ir a `/employees`
3. **Verificar en la tabla:**
   - La invitación ahora está marcada como:
     - 🟢 Estado: `accepted` (badge verde)
     - Ya no tiene botones de "Reenviar" ni "Revocar"

---

### **Paso 6: Probar Revocar Invitación** ✅

1. Como Owner, enviar otra invitación:
   - Email: `empleado2@test.com`
2. **Antes de aceptarla**, hacer click en **"Revocar"**
3. Confirmar la revocación
4. **Verificar:**
   - ✅ El estado cambia a `revoked` (badge rojo)
   - ✅ Si intentas usar el token en `/accept-invitation`, debería decir "inválida"

---

### **Paso 7: Probar Reenviar Invitación** ✅

1. Enviar otra invitación: `empleado3@test.com`
2. Click en **"Reenviar"**
3. **Verificar:**
   - ✅ Aparece un alert con la nueva URL
   - ✅ El token sigue siendo el mismo
   - ✅ La fecha de creación no cambia

---

## ✅ Checklist de Funcionalidad

### **Backend API:**
- [ ] POST /api/invitations - Crear invitación
- [ ] GET /api/invitations/validate/:token - Validar token
- [ ] POST /api/invitations/accept - Aceptar invitación
- [ ] GET /api/invitations/store/:id - Listar invitaciones
- [ ] GET /api/invitations/store/:id/pending - Listar pendientes
- [ ] GET /api/invitations/store/:id/stats - Estadísticas
- [ ] POST /api/invitations/:id/revoke - Revocar
- [ ] POST /api/invitations/:id/resend - Reenviar

### **Frontend UI:**
- [ ] Página /employees carga correctamente
- [ ] Tabla de invitaciones muestra datos
- [ ] Modal de invitar empleado funciona
- [ ] Página /accept-invitation valida token
- [ ] Formulario de aceptación crea cuenta
- [ ] Redirección automática después de aceptar
- [ ] Badges de colores por estado
- [ ] Botones de revocar/reenviar funcionan

### **Seguridad:**
- [ ] Solo owners ven el enlace "Empleados"
- [ ] Solo owners pueden enviar invitaciones
- [ ] Tokens expiran después de 7 días
- [ ] Tokens inválidos son rechazados
- [ ] Validación de contraseñas funciona

### **Edge Cases:**
- [ ] Invitación duplicada revoca la anterior
- [ ] Token expirado muestra mensaje correcto
- [ ] Token revocado no se puede usar
- [ ] Empleado existente no crea cuenta duplicada
- [ ] Sin tienda seleccionada, /employees pide seleccionar

---

## 🐛 Problemas Comunes

### **Error: "getaddrinfo ENOTFOUND"**
- **Solución:** Ya corregido - InvitationModel ahora usa Supabase client

### **Invitación no aparece en la tabla**
- Verificar que estás viendo la tienda correcta
- Refresh la página
- Verificar que el token del owner es válido

### **Token inválido al aceptar**
- Verificar que la URL está completa
- Verificar que no ha pasado 7 días
- Verificar que no fue revocada

---

## 📊 Resultado Esperado

Si **TODOS** los pasos anteriores funcionan correctamente:

✅ **Sistema de Invitaciones 100% Funcional**
- Owners invitan empleados
- Empleados crean cuentas
- Empleados obtienen acceso automático
- Gestión completa de invitaciones
- UI moderna y responsive

---

## 🎉 ¡Listo para Usar!

El Sprint 2.1 está completamente implementado y funcional. 

**Documentos de referencia:**
- `SPRINT_2.1_TESTING_GUIDE.md` - Guía detallada con todos los endpoints
- `SPRINT_2.1_COMPLETE.md` - Resumen completo del sprint

**Próximo paso:** Sprint 2.2 - Inventory Management 🚀

