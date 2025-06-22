# 🔥 Configuración de Índices de Firestore - Re-Mindly

## ⚠️ Error: "The query requires an index"

Este error ocurre cuando Firestore necesita un índice compuesto para optimizar consultas que filtran y ordenan al mismo tiempo.

## 🚀 Solución Rápida:

### 1. Crear Índice Automáticamente (Recomendado)
1. **Haz clic en el enlace** que aparece en el error en la consola del navegador
2. **Se abrirá Firebase Console** con el índice preconfigurado
3. **Haz clic en "Crear índice"**
4. **Espera** a que el índice se construya (puede tomar unos minutos)

### 2. Crear Índice Manualmente

#### En Firebase Console:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `re-mindly`
3. Ve a **Firestore Database** > **Índices**
4. Haz clic en **"Crear índice"**

#### Configuración del Índice:
```
Colección: tasks
Campos del índice:
- userId (Ascending)
- createdAt (Descending)
- __name__ (Ascending)
```

## 📋 Índices Necesarios para Re-Mindly:

### 1. Índice para Consulta de Tareas
```javascript
// Para la consulta: where('userId', '==', userId), orderBy('createdAt', 'desc')
{
  "collectionGroup": "tasks",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    },
    {
      "fieldPath": "__name__",
      "order": "ASCENDING"
    }
  ]
}
```

### 2. Índice para Consulta de Recordatorios (si los usas)
```javascript
// Para recordatorios por usuario y fecha
{
  "collectionGroup": "reminders",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "scheduledTime",
      "order": "ASCENDING"
    }
  ]
}
```

## 🔍 Verificar que el Índice Funciona:

1. **Espera** a que el índice se construya (estado: "Building" → "Enabled")
2. **Recarga** la página de tu aplicación
3. **Verifica** que no aparezcan más errores de índice en la consola

## ⏱️ Tiempo de Construcción:

- **Índices pequeños**: 1-2 minutos
- **Índices grandes**: 5-10 minutos
- **Mientras se construye**: Las consultas pueden fallar

## 🛠️ Configuración Automática (Opcional):

Si quieres configurar índices automáticamente, puedes usar Firebase CLI:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
```

## 📁 Archivo firestore.indexes.json:

```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 🚨 Errores Comunes:

### Error: "Index is building"
- **Solución**: Espera a que termine de construirse
- **Tiempo**: Normalmente 1-5 minutos

### Error: "Index not found"
- **Solución**: Verifica que el índice se creó correctamente
- **Verificación**: Ve a Firestore > Índices

### Error: "Too many indexes"
- **Solución**: Revisa y elimina índices no utilizados
- **Límite**: 200 índices por proyecto

## ✅ Después de Crear el Índice:

1. **Recarga** la aplicación
2. **Navega** al feed page
3. **Verifica** que las tareas se cargan correctamente
4. **Comprueba** que no hay errores en la consola

---

**Nota**: Los índices son necesarios para consultas eficientes en Firestore. Una vez creados, mejoran significativamente el rendimiento de tu aplicación. 