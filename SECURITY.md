# 🔒 Guía de Seguridad - Re-Mindly

## ⚠️ IMPORTANTE: Protección de Claves y Configuraciones

### 🚨 NUNCA subas estos archivos a Git:

1. **Archivos de configuración con claves:**
   - `google-services.json` (Firebase Android)
   - `GoogleService-Info.plist` (Firebase iOS)
   - `environment.ts` (con claves reales)
   - `secrets.json`
   - `api-keys.json`
   - `*.keystore` (archivos de firma Android)
   - `key.properties` (Android)

2. **Archivos de entorno:**
   - `.env`
   - `.env.local`
   - `.env.production`

3. **Archivos de build y cache:**
   - `node_modules/`
   - `android/build/`
   - `android/app/build/`
   - `ios/App/build/`

### ✅ Cómo configurar de forma segura:

#### 1. Variables de Entorno
```bash
# Crea un archivo .env (NO subir a Git)
cp .env.example .env
# Edita .env con tus valores reales
```

#### 2. Configuración de Firebase
```bash
# Descarga google-services.json desde Firebase Console
# Colócalo en android/app/ (ya está en .gitignore)
# Descarga GoogleService-Info.plist para iOS
# Colócalo en ios/App/App/ (ya está en .gitignore)
```

#### 3. Configuración de Environment
```bash
# Copia el archivo de ejemplo
cp src/environments/environment.example.ts src/environments/environment.ts
# Edita environment.ts con tus valores reales
```

### 🔧 Configuración para desarrollo:

1. **Copia el archivo de ejemplo:**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

2. **Edita `environment.ts` con tus valores reales:**
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: 'TU_API_KEY_REAL_AQUI',
       // ... resto de configuración
     }
   };
   ```

### 📱 Configuración para Android/iOS:

#### Android:
- Descarga `google-services.json` desde Firebase Console
- Colócalo en `android/app/`
- NO lo subas a Git (ya está en .gitignore)

#### iOS:
- Descarga `GoogleService-Info.plist` desde Firebase Console
- Colócalo en `ios/App/App/`
- NO lo subas a Git (ya está en .gitignore)

### 🛡️ Verificación de seguridad:

Antes de hacer commit, verifica que NO estés subiendo archivos sensibles:

```bash
# Verifica qué archivos se van a subir
git status

# Verifica que no haya claves en los archivos
grep -r "TU_API_KEY" src/
grep -r "google-services" .
```

### 🚀 Para producción:

1. Usa variables de entorno del servidor
2. Configura secrets en tu plataforma de deployment
3. Usa archivos de configuración específicos para producción

### 📞 Si encuentras claves expuestas:

1. **INMEDIATAMENTE** revoca las claves en la consola correspondiente
2. Genera nuevas claves
3. Actualiza todos los archivos de configuración
4. Considera usar herramientas como `git-secrets` para prevenir futuras exposiciones

---

**Recuerda: Una vez que las claves se suben a Git, quedan en el historial para siempre. ¡Siempre verifica antes de hacer commit!** 