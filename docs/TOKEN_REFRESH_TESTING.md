# 🧪 Prueba Rápida del Sistema de Renovación de Tokens

## 🎯 Problema Resuelto

Antes: **"Invalid or expired token"** después de 30 minutos  
Ahora: **Renovación automática sin interrupciones**

---

## ⚡ Prueba Rápida (5 minutos)

### **Paso 1: Iniciar Ambos Servidores**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd flowence-client
npm run dev
```

### **Paso 2: Login y Abrir DevTools**

1. Navega a `http://localhost:3000/login`
2. Haz login con tu usuario
3. Abre DevTools (F12) → Pestaña **Console**

### **Paso 3: Verificar Auto-Refresh Activado**

En la consola deberías ver:
```
⏰ Setting up token auto-refresh (every 25 minutes)
```

✅ Esto confirma que el sistema de auto-refresh está activo.

---

## 🔬 Prueba del Interceptor 401 (Simulación)

Para probar sin esperar 30 minutos, vamos a simular un token expirado.

### **Método 1: Cambiar Expiración a 1 Minuto**

1. **Editar** `server/src/services/AuthService.ts`:

```typescript
private generateToken(user: { id: string; email: string; role: string }): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: '1m', // ← Cambiar de '30m' a '1m'
    issuer: 'flowence',
    audience: 'flowence-users'
  });
}
```

2. **Reconstruir** el servidor:
```bash
cd server
npm run build
npm run dev
```

3. **Hacer login** nuevamente

4. **Esperar 1 minuto** sin hacer nada

5. **Hacer una acción** (ir a `/employees`, enviar invitación, etc.)

6. **Observar en la consola**:
```
🔑 Received 401, attempting token refresh...
🔄 Refreshing access token...
✅ Token refreshed successfully
```

7. ✅ **La acción se completa sin errores** (el interceptor renovó el token automáticamente)

8. **Revertir el cambio** después de probar (volver a `'30m'`)

---

### **Método 2: Manipular Token en localStorage**

1. Abrir DevTools → Console

2. Ejecutar:
```javascript
// Guardar token actual
const token = localStorage.getItem('token');
console.log('Token actual:', token);

// Crear un token expirado (este fallará, pero el sistema lo renovará)
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token');
```

3. Hacer una acción (ir a otra página)

4. El sistema debería:
   - Detectar el 401
   - Intentar renovar
   - Si el token original ya no sirve, redirigir al login

---

## 📊 Verificación de Logs

### **Frontend (DevTools Console)**

Logs esperados durante el ciclo de vida:

#### Al hacer login:
```
⏰ Setting up token auto-refresh (every 25 minutes)
```

#### Cada 25 minutos (si está activo):
```
🔄 Auto-refreshing token...
✅ Token auto-refreshed successfully
```

#### Si recibe 401:
```
🔑 Received 401, attempting token refresh...
🔄 Refreshing access token...
✅ Token refreshed successfully
```

#### Si la renovación falla:
```
❌ Token refresh failed: Error...
Failed to refresh token, redirecting to login...
```

---

### **Backend (Terminal)**

Logs esperados en el servidor:

#### Al renovar token:
```
🔄 AuthController: Refresh token request received
🔑 AuthController: Refresh token (first 50 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiO...
🔄 Token refreshed successfully for user: usuario@ejemplo.com
```

#### Si token está en período de gracia:
```
⏰ Token expired, checking grace period...
✅ Token within grace period, allowing refresh
🔄 Token refreshed successfully for user: usuario@ejemplo.com
```

---

## ✅ Checklist de Funcionalidad

### **Sistema de Auto-Refresh:**
- [ ] Login exitoso muestra mensaje "Setting up token auto-refresh"
- [ ] El usuario puede permanecer logueado más de 30 minutos
- [ ] No se ve el error "Invalid or expired token"

### **Interceptor 401:**
- [ ] Si el token expira, el sistema intenta renovarlo automáticamente
- [ ] Las acciones se completan sin errores visibles para el usuario
- [ ] Solo redirige al login si la renovación falla completamente

### **Período de Gracia:**
- [ ] Tokens expirados hace menos de 5 minutos pueden renovarse
- [ ] Tokens expirados hace más de 5 minutos requieren re-login

---

## 🚨 Troubleshooting

### **Error: "Failed to refresh token"**

**Causa:** El token expiró hace más de 5 minutos o es inválido.

**Solución:** Hacer login nuevamente.

---

### **Error: "User not found"**

**Causa:** El usuario del token fue eliminado de la base de datos.

**Solución:** 
1. Verificar que el usuario existe en la BD
2. Hacer login nuevamente

---

### **No se ve el mensaje de auto-refresh**

**Causa:** El usuario no está logueado o el token es null.

**Solución:**
1. Verificar que el login fue exitoso
2. Verificar que hay un token en localStorage:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

---

### **El interceptor no funciona**

**Verificar:**
1. ¿El backend está corriendo?
2. ¿El endpoint `/api/auth/refresh-token` existe?
```bash
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "tu-token-aqui"}'
```

---

## 📈 Métricas de Éxito

### **Antes de la Implementación:**
- ❌ Usuario debe re-login cada 30 minutos
- ❌ Errores visibles de token expirado
- ❌ Pérdida de datos en formularios

### **Después de la Implementación:**
- ✅ Usuario permanece logueado indefinidamente (mientras esté activo)
- ✅ Renovación silenciosa cada 25 minutos
- ✅ Recuperación automática de errores 401
- ✅ Experiencia fluida sin interrupciones

---

## 🎉 Confirmación Final

Si ves estos logs, **el sistema está funcionando correctamente**:

```
✅ Frontend Console:
   ⏰ Setting up token auto-refresh (every 25 minutes)
   🔄 Auto-refreshing token...
   ✅ Token auto-refreshed successfully

✅ Backend Terminal:
   🔄 AuthController: Refresh token request received
   🔄 Token refreshed successfully for user: usuario@ejemplo.com
```

---

**¡Sistema de Renovación de Tokens Funcionando! 🚀**

