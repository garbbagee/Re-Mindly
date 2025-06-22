# 🔥 Configuración de Firebase - Re-Mindly

## ⚠️ IMPORTANTE: Configuración Requerida

Para que la aplicación funcione correctamente, necesitas configurar Firebase con tus credenciales reales.

### 📋 Pasos para configurar Firebase:

#### 1. Crear proyecto en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Authentication (Email/Password)
4. Habilita Firestore Database

#### 2. Obtener configuración de Firebase
1. En Firebase Console, ve a Configuración del proyecto
2. En la pestaña "General", busca "Tus apps"
3. Haz clic en el ícono de web (</>) para agregar una app web
4. Registra tu app y copia la configuración

#### 3. Configurar environment.ts
1. Abre `src/environments/environment.ts`
2. Reemplaza los valores de ejemplo con tu configuración real:

```typescript
export const environment = {
  production: false,
  
  firebaseConfig: {
    apiKey: 'TU_API_KEY_REAL_AQUI',
    authDomain: 'tu-proyecto-real.firebaseapp.com',
    projectId: 'tu-proyecto-real-id',
    storageBucket: 'tu-proyecto-real.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef1234567890'
  },
  
  // ... resto de configuración
};
```

#### 4. Configurar reglas de Firestore
En Firebase Console > Firestore Database > Reglas, usa estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### 5. Configurar Authentication
1. En Firebase Console > Authentication
2. Ve a la pestaña "Sign-in method"
3. Habilita "Email/Password"
4. Opcional: Configura otros métodos de autenticación

### 🚨 Errores comunes y soluciones:

#### Error: "TU_API_KEY_AQUI"
- **Causa**: No has configurado la API key real de Firebase
- **Solución**: Reemplaza `'TU_API_KEY_AQUI'` con tu API key real en `environment.ts`

#### Error: "400 Bad Request" en login
- **Causa**: Configuración incorrecta de Firebase o proyecto no configurado
- **Solución**: 
  1. Verifica que tu configuración de Firebase sea correcta
  2. Asegúrate de que Authentication esté habilitado
  3. Verifica que las reglas de Firestore permitan acceso

#### Error: "Not implemented on web" (notificaciones)
- **Causa**: Las notificaciones locales de Capacitor no funcionan en web
- **Solución**: Ya está arreglado - el código ahora usa la API de notificaciones del navegador en web

### 🔧 Para desarrollo local:

1. **Configuración mínima para pruebas:**
   ```typescript
   firebaseConfig: {
     apiKey: 'demo-key-for-testing',
     authDomain: 'demo-project.firebaseapp.com',
     projectId: 'demo-project',
     storageBucket: 'demo-project.appspot.com',
     messagingSenderId: '123456789',
     appId: '1:123456789:web:demo123'
   }
   ```

2. **Para pruebas sin Firebase:**
   - Comenta temporalmente las llamadas a Firebase en los servicios
   - Usa datos mock para desarrollo

### 📱 Para producción:

1. **Variables de entorno:**
   - Usa variables de entorno del servidor
   - No subas claves reales a Git
   - Configura secrets en tu plataforma de deployment

2. **Seguridad:**
   - Configura reglas de Firestore apropiadas
   - Usa autenticación robusta
   - Implementa validación de datos

### 🆘 Si necesitas ayuda:

1. Revisa la [documentación oficial de Firebase](https://firebase.google.com/docs)
2. Verifica que todos los servicios estén habilitados en Firebase Console
3. Revisa los logs de la consola del navegador para errores específicos

---

**Recuerda: Nunca subas claves reales de Firebase a Git. Usa archivos de configuración locales y variables de entorno.** 