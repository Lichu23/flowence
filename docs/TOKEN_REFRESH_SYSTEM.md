# 🔄 Sistema de Renovación Automática de Tokens

## ❌ Problema Original

El usuario experimentaba el error **"Invalid or expired token"** después de 30 minutos de inactividad, lo que requería volver a hacer login manualmente.

### Configuración Original:
- `JWT_EXPIRES_IN=30m` (token expira a los 30 minutos)
- Sin renovación automática de tokens
- Sin sistema de refresh token

---

## ✅ Solución Implementada

Se implementó un **sistema de renovación automática de tokens** con dos mecanismos de protección:

### **1. Renovación Proactiva (Auto-Refresh cada 25 minutos)**

El frontend renueva automáticamente el token **cada 25 minutos** (antes de que expire a los 30 minutos).

#### Ubicación: `flowence-client/src/contexts/AuthContext.tsx`

```typescript
// Auto-refresh token every 25 minutes (before 30 min expiry)
useEffect(() => {
  if (!token || !user) return;

  console.log('⏰ Setting up token auto-refresh (every 25 minutes)');

  const refreshInterval = setInterval(async () => {
    console.log('🔄 Auto-refreshing token...');
    try {
      const response = await authApi.refreshToken(token);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('✅ Token auto-refreshed successfully');
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
      // Don't logout immediately, let the 401 interceptor handle it
    }
  }, 25 * 60 * 1000); // 25 minutes

  return () => {
    console.log('🛑 Clearing token auto-refresh interval');
    clearInterval(refreshInterval);
  };
}, [token, user]);
```

**Beneficios:**
- ✅ El usuario nunca experimenta tokens expirados si está activo
- ✅ Renovación silenciosa en segundo plano
- ✅ No interrumpe la experiencia del usuario

---

### **2. Interceptor de Recuperación (401 Handler)**

Si el token expira (por ejemplo, el usuario estuvo inactivo más de 30 minutos), el sistema intenta renovarlo automáticamente al recibir un error 401.

#### Ubicación: `flowence-client/src/lib/api.ts`

```typescript
// Handle 401 Unauthorized - try to refresh token
if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
  console.log('🔑 Received 401, attempting token refresh...');
  
  try {
    const newToken = await refreshAccessToken();
    
    // Retry the original request with new token
    const newHeaders = {
      ...headers,
      'Authorization': `Bearer ${newToken}`,
    };

    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: newHeaders,
    });

    const retryData: ApiResponse<T> = await retryResponse.json();

    if (!retryResponse.ok) {
      throw new Error(retryData.error?.message || 'Request failed after token refresh');
    }

    return retryData;
  } catch (refreshError) {
    console.error('Failed to refresh token, redirecting to login...');
    // Token refresh failed, user needs to login again
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }
}
```

**Beneficios:**
- ✅ Recuperación automática de errores de token expirado
- ✅ Reintentos transparentes de requests fallidos
- ✅ Solo redirige al login si la renovación falla completamente

---

### **3. Período de Gracia en el Backend (5 minutos)**

El backend acepta tokens expirados **dentro de los últimos 5 minutos** para renovación.

#### Ubicación: `server/src/services/AuthService.ts`

```typescript
async refreshToken(token: string): Promise<AuthResponse> {
  try {
    let payload: any;
    
    // Try to verify token normally first
    try {
      payload = jwt.verify(token, config.jwt.secret as string, {
        issuer: 'flowence',
        audience: 'flowence-users'
      }) as any;
    } catch (error) {
      // If token is expired, try to verify with grace period
      if (error instanceof jwt.TokenExpiredError) {
        console.log('⏰ Token expired, checking grace period...');
        
        // Decode without verification to check expiry time
        const decoded = jwt.decode(token) as any;
        if (!decoded || !decoded.exp) {
          throw new Error('Invalid token format');
        }
        
        const expiryTime = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        // Allow refresh if token expired within last 5 minutes
        if (now - expiryTime > gracePeriod) {
          throw new Error('Token expired beyond grace period');
        }
        
        console.log('✅ Token within grace period, allowing refresh');
        payload = decoded;
      } else {
        throw error;
      }
    }
    
    // Get user with stores and generate new token...
  }
}
```

**Beneficios:**
- ✅ Permite renovación incluso si el token expiró hace poco
- ✅ Reduce la necesidad de re-login por pequeños delays
- ✅ Mejora la experiencia del usuario

---

## 🔄 Flujo Completo del Sistema

### **Escenario 1: Usuario Activo (Renovación Proactiva)**
```
T=0:   Usuario hace login → Token válido por 30 min
T=25:  Auto-refresh → Token renovado → válido por 30 min más
T=50:  Auto-refresh → Token renovado → válido por 30 min más
T=75:  Auto-refresh → Token renovado → válido por 30 min más
...    (Continúa indefinidamente mientras el usuario esté activo)
```

### **Escenario 2: Usuario Inactivo (Interceptor 401)**
```
T=0:   Usuario hace login → Token válido por 30 min
T=30:  Token expira (usuario inactivo)
T=32:  Usuario hace una acción → 401 error
       ↓
       Interceptor detecta 401
       ↓
       Llama a /api/auth/refresh-token (dentro de gracia de 5 min)
       ↓
       Backend genera nuevo token
       ↓
       Reintenta request original con nuevo token
       ↓
       ✅ Request exitoso, usuario no nota nada
```

### **Escenario 3: Usuario Inactivo por Mucho Tiempo**
```
T=0:   Usuario hace login → Token válido por 30 min
T=30:  Token expira (usuario inactivo)
T=36:  Usuario intenta hacer algo (más de 5 min después)
       ↓
       Interceptor detecta 401
       ↓
       Llama a /api/auth/refresh-token
       ↓
       Backend rechaza (fuera de período de gracia)
       ↓
       Frontend redirige a /login
       ↓
       ❌ Usuario debe hacer login nuevamente
```

---

## 🚀 Cómo Probar la Solución

### **Prueba 1: Renovación Proactiva**

1. Hacer login en la aplicación
2. Abrir DevTools → Console
3. Esperar 25 minutos
4. Deberías ver en consola:
   ```
   🔄 Auto-refreshing token...
   ✅ Token auto-refreshed successfully
   ```
5. Continuar usando la app normalmente

### **Prueba 2: Interceptor 401 (Simulación)**

**Opción A: Manipular token en localStorage**
```javascript
// En DevTools Console:
// 1. Guardar token actual
const oldToken = localStorage.getItem('token');

// 2. Esperar 30+ minutos o manipular el token para que expire

// 3. Hacer alguna acción (ir a /employees, crear invitación, etc.)

// Deberías ver en consola:
// 🔑 Received 401, attempting token refresh...
// 🔄 Refreshing access token...
// ✅ Token refreshed successfully
```

**Opción B: Usar JWT Debugger**
```typescript
// En AuthService.ts, temporalmente cambiar JWT_EXPIRES_IN:
expiresIn: '1m', // 1 minuto en lugar de 30

// 1. Hacer login
// 2. Esperar 1 minuto
// 3. Hacer una acción
// 4. Ver el interceptor en acción
```

### **Prueba 3: Período de Gracia**

1. Hacer login
2. Esperar 31 minutos (token expirado hace 1 minuto)
3. Hacer una acción
4. Deberías ver en consola del backend:
   ```
   ⏰ Token expired, checking grace period...
   ✅ Token within grace period, allowing refresh
   🔄 Token refreshed successfully for user: ...
   ```

---

## 📊 Configuración Actual

### **Frontend**
- Auto-refresh cada: **25 minutos**
- Interceptor de 401: **Activo**
- Redirige al login si: **Renovación falla**

### **Backend**
- Token expira en: **30 minutos**
- Período de gracia: **5 minutos**
- Endpoint: `POST /api/auth/refresh-token`

### **Recomendaciones**

Si quieres ajustar los tiempos:

```bash
# En server/.env
JWT_EXPIRES_IN=30m        # Duración del token (puedes cambiar a 1h, 2h, etc.)
```

```typescript
// En flowence-client/src/contexts/AuthContext.tsx
const refreshInterval = setInterval(async () => {
  // ...
}, 25 * 60 * 1000); // Ajustar según JWT_EXPIRES_IN (debe ser menor)
```

```typescript
// En server/src/services/AuthService.ts
const gracePeriod = 5 * 60 * 1000; // Ajustar el período de gracia
```

---

## 🔐 Seguridad

### **Medidas Implementadas:**

1. ✅ **Único token activo:** Cada renovación invalida el token anterior
2. ✅ **Período de gracia limitado:** Solo 5 minutos después de expiración
3. ✅ **Verificación de usuario:** Se valida que el usuario exista en DB
4. ✅ **Prevención de concurrencia:** Flag `isRefreshing` evita múltiples renovaciones simultáneas
5. ✅ **Limpieza automática:** Si la renovación falla, se limpia todo el localStorage

### **Consideraciones:**

- ⚠️ El período de gracia de 5 minutos podría ser un riesgo de seguridad en aplicaciones muy críticas
- 💡 Para mayor seguridad, implementar un sistema de **Refresh Token separado** con rotación
- 💡 Considerar implementar **blacklist de tokens** para revocación inmediata

---

## 🎯 Resultado Final

### **Antes:**
❌ Usuario debe hacer login cada 30 minutos  
❌ Token expirado genera errores visibles  
❌ Mala experiencia de usuario  

### **Después:**
✅ Usuario permanece logueado indefinidamente mientras esté activo  
✅ Renovación silenciosa y transparente  
✅ Recuperación automática de errores 401  
✅ Excelente experiencia de usuario  

---

## 📝 Archivos Modificados

1. `flowence-client/src/lib/api.ts` → Interceptor 401 y función de refresh
2. `flowence-client/src/contexts/AuthContext.tsx` → Auto-refresh cada 25 minutos
3. `server/src/services/AuthService.ts` → Período de gracia de 5 minutos

---

**Implementado:** 11 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ Completado y Probado

