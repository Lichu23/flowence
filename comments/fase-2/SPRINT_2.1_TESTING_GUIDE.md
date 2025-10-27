# 🧪 Plan de Testeo - Sprint 2.1: Sistema de Invitaciones

## ✅ Estado de Implementación (Backend)

### **Completado:**
- ✅ `InvitationModel.ts` - Operaciones de base de datos
- ✅ `InvitationService.ts` - Lógica de negocio
- ✅ `InvitationController.ts` - Endpoints REST
- ✅ Rutas API registradas en `app.ts`
- ✅ Endpoint para aceptar invitaciones (público)
token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZTM5NjQxNS05MTU3LTQ1MjktOWMzZC05ZmQ4NGJkYzIyZTEiLCJlbWFpbCI6Im93bmVyQHRlc3QuY29tIiwicm9sZSI6Im93bmVyIiwiaWF0IjoxNzYwMTI3MDg2LCJleHAiOjE3NjAxMjg4ODYsImF1ZCI6ImZsb3dlbmNlLXVzZXJzIiwiaXNzIjoiZmxvd2VuY2UifQ.LvOj9QXNVX9bdvn66VJpwZK7ueZpyzBH1ThB1ATtwd4

storeid: 3543a1de-35e0-46d3-9a27-b8c98f954c32

invitation:
http://localhost:3000/accept-invitation?token=2b5d6af3ac4ba452659dda182dd2bc218c321946c7b85ed3ffb38fa41f7ec208
token:2b5d6af3ac4ba452659dda182dd2bc218c321946c7b85ed3ffb38fa41f7ec208
### **Pendiente:**
- ❌ Integración de SendGrid para emails
- ❌ Frontend (tipos, API client, UI)

---

## 📋 Endpoints Disponibles

### **Endpoints Públicos** (sin autenticación)
```
GET  /api/invitations/validate/:token - Validar token de invitación
POST /api/invitations/accept          - Aceptar invitación y crear cuenta
```

### **Endpoints Protegidos** (requieren autenticación)
```
POST /api/invitations                      - Enviar invitación
GET  /api/invitations/store/3543a1de-35e0-46d3-9a27-b8c98f954c32 (<- storeid)       - Listar invitaciones de tienda
GET  /api/invitations/store/:storeId/pending - Listar invitaciones pendientes
GET  /api/invitations/store/:storeId/stats   - Estadísticas de invitaciones
POST /api/invitations/:id/revoke            - Revocar invitación
POST /api/invitations/:id/resend            - Reenviar invitación
```

---

## 🔧 Tests a Realizar

### **Test 1: Enviar Invitación**

**Prerequisitos:**
- Tener un usuario owner registrado
- Tener una tienda creada
- Tener el token de autenticación

**Request:**
```bash
curl -X POST http://localhost:3001/api/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "store_id": "YOUR_STORE_ID",
    "email": "empleado@example.com",
    "role": "employee"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "uuid...",
      "store_id": "uuid...",
      "email": "empleado@example.com",
      "token": "hex_token...",
      "role": "employee",
      "status": "pending",
      "invited_by": "owner_id...",
      "expires_at": "2025-10-17T...",
      "created_at": "2025-10-10T..."
    },
    "invitationUrl": "http://localhost:3000/accept-invitation?token=..."
  },
  "message": "Invitation sent successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 201
- ✅ Se genera un token único
- ✅ La fecha de expiración es 7 días en el futuro
- ✅ El invitationUrl contiene el token correcto
- ✅ El status es "pending"

---

### **Test 2: Validar Token de Invitación**

**Request:**
```bash
curl -X GET http://localhost:3001/api/invitations/validate/TOKEN_FROM_TEST_1
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "invitation": {
      "id": "uuid...",
      "store_id": "uuid...",
      "email": "empleado@example.com",
      "role": "employee",
      "status": "pending",
      ...
    },
    "store": {
      "id": "uuid...",
      "name": "Mi Tienda",
      "address": "...",
      ...
    }
  },
  "message": "Token is valid",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ `valid` es `true`
- ✅ Se incluyen los datos de la invitación
- ✅ Se incluyen los datos de la tienda

---

### **Test 3: Aceptar Invitación (Crear Nueva Cuenta)**

**Request:**
```bash
curl -X POST http://localhost:3001/api/invitations/accept \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_TEST_1",
    "name": "Nuevo Empleado",
    "password": "Password123!@#"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "email": "empleado@example.com",
      "name": "Nuevo Empleado",
      "role": "employee",
      "stores": [
        {
          "id": "store_uuid...",
          "name": "Mi Tienda",
          "role": "employee"
        }
      ]
    },
    "token": "jwt_token..."
  },
  "message": "Invitation accepted successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ Se crea la cuenta del empleado
- ✅ El empleado tiene acceso a la tienda
- ✅ Se devuelve un JWT token válido
- ✅ El rol del usuario es "employee"
- ✅ La invitación cambia a status "accepted"

---

### **Test 4: Listar Invitaciones de una Tienda**

**Request:**
```bash
curl -X GET http://localhost:3001/api/invitations/store/STORE_ID \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid...",
      "email": "empleado@example.com",
      "role": "employee",
      "status": "accepted",
      "created_at": "2025-10-10T...",
      ...
    }
  ],
  "message": "Invitations retrieved successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ Se listan todas las invitaciones de la tienda
- ✅ Incluye invitaciones aceptadas, pendientes y expiradas

---

### **Test 5: Obtener Invitaciones Pendientes**

**Request:**
```bash
curl -X GET http://localhost:3001/api/invitations/store/STORE_ID/pending \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": [
    // Solo invitaciones con status "pending"
  ],
  "message": "Pending invitations retrieved successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ Solo se listan invitaciones con status "pending"
- ✅ No se incluyen invitaciones aceptadas o expiradas

---

### **Test 6: Revocar Invitación**

**Request:**
```bash
curl -X POST http://localhost:3001/api/invitations/INVITATION_ID/revoke \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Invitation revoked successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ La invitación cambia a status "revoked"
- ✅ El token de la invitación ya no es válido

---

### **Test 7: Reenviar Invitación**

**Request:**
```bash
curl -X POST http://localhost:3001/api/invitations/INVITATION_ID/resend \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "uuid...",
      "status": "pending",
      ...
    },
    "invitationUrl": "http://localhost:3000/accept-invitation?token=..."
  },
  "message": "Invitation resent successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ Se devuelve el mismo token
- ✅ El status sigue siendo "pending"

---

### **Test 8: Obtener Estadísticas**

**Request:**
```bash
curl -X GET http://localhost:3001/api/invitations/store/STORE_ID/stats \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "pending": 2,
    "accepted": 2,
    "expired": 1,
    "revoked": 0
  },
  "message": "Statistics retrieved successfully",
  "timestamp": "2025-10-10T..."
}
```

**¿Qué Verificar?**
- ✅ Status code 200
- ✅ Las estadísticas son precisas
- ✅ Los números suman correctamente

---

## 🚫 Tests de Validación y Errores

### **Test 9: Intentar Enviar Invitación sin Ser Owner**

**Request:**
```bash
curl -X POST http://localhost:3001/api/invitations \
  -H "Authorization: Bearer EMPLOYEE_TOKEN" \
  -d '{...}'
```

**Respuesta Esperada:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only store owners can send invitations"
  }
}
```

---

### **Test 10: Aceptar Invitación con Token Inválido**

**Request:**
```bash
curl -X POST http://localhost:3001/api/invitations/accept \
  -d '{
    "token": "invalid_token",
    "name": "Test",
    "password": "Password123!@#"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": false,
  "error": {
    "code": "INVITATION_INVALID",
    "message": "Invalid invitation token"
  }
}
```

---

### **Test 11: Aceptar Invitación Expirada**

Crear una invitación con fecha pasada y luego intentar aceptarla.

**Respuesta Esperada:**
```json
{
  "success": false,
  "error": {
    "code": "INVITATION_EXPIRED",
    "message": "Invitation has expired or is no longer valid"
  }
}
```

---

### **Test 12: Enviar Invitación Duplicada**

Enviar dos invitaciones al mismo email para la misma tienda.

**Resultado Esperado:**
- La primera invitación se revoca automáticamente
- Se crea una nueva invitación
- Ambas operaciones son exitosas

---

## 📝 Checklist de Funcionalidad

### **Funcionalidad del Model**
- [ ] Crear invitación con token único
- [ ] Buscar invitación por ID
- [ ] Buscar invitación por token
- [ ] Buscar invitaciones por tienda
- [ ] Filtrar por status
- [ ] Validar token (checks expiration)
- [ ] Marcar como aceptada
- [ ] Marcar como revocada
- [ ] Auto-expirar invitaciones antiguas
- [ ] Obtener estadísticas correctas

### **Funcionalidad del Service**
- [ ] Enviar invitación válida
- [ ] Rechazar invitación de no-owner
- [ ] Revocar invitación anterior si existe
- [ ] Aceptar invitación (crear cuenta nueva)
- [ ] Aceptar invitación (usuario existente)
- [ ] Validar permisos correctamente
- [ ] Generar URLs de invitación correctas

### **Funcionalidad del Controller**
- [ ] Todos los endpoints responden con formato correcto
- [ ] Validación de inputs funciona
- [ ] Manejo de errores apropiado
- [ ] Autenticación requerida en endpoints protegidos
- [ ] Endpoints públicos accesibles sin token

---

## 🎯 Cómo Empezar a Testear

### **Paso 1: Iniciar el Servidor**
```bash
cd server
npm run dev
```

### **Paso 2: Crear un Usuario Owner**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "Owner123!@#",
    "name": "Test Owner",
    "store_name": "Test Store",
    "store_address": "123 Main St",
    "store_phone": "+1234567890"
  }'
```

**Guardar:**
- El `token` de la respuesta (OWNER_TOKEN)
- El `id` de la tienda (STORE_ID)

### **Paso 3: Ejecutar los Tests en Orden**
Ejecutar cada test del 1 al 12, reemplazando:
- `YOUR_TOKEN` con el token del owner
- `YOUR_STORE_ID` con el ID de la tienda
- `TOKEN_FROM_TEST_1` con el token de invitación generado

---

## 📊 Resultado Esperado Final

Después de ejecutar todos los tests:

✅ **Backend del Sistema de Invitaciones funcionando al 100%**
- Owners pueden enviar invitaciones
- Las invitaciones se validan correctamente
- Empleados pueden aceptar invitaciones
- Se crean cuentas automáticamente
- Los permisos se verifican correctamente
- Las estadísticas son precisas
- Las invitaciones expiran automáticamente

⚠️ **Pendiente:**
- Integración de SendGrid (los emails no se envían aún)
- Frontend UI
- Tests automatizados

---

## 🐛 Si Algo No Funciona

1. **Verificar que el servidor esté corriendo**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verificar que la base de datos tenga la tabla invitations**
   ```sql
   SELECT * FROM invitations LIMIT 1;
   ```

3. **Verificar logs del servidor**
   Los logs mostrarán información detallada de cada operación

4. **Verificar formato JSON**
   Asegúrate de que los requests tengan `Content-Type: application/json`

---

¡Sprint 2.1 Backend Completo! 🎉

