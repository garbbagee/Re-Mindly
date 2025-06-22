// Archivo de ejemplo para configuraciones de entorno
// Copia este archivo como environment.ts y agrega tus valores reales

export const environment = {
  production: false,
  
  // Firebase Configuration
  firebase: {
    apiKey: 'TU_API_KEY_AQUI',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto-id',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456'
  },
  
  // Otras APIs
  apiUrl: 'https://tu-api.com',
  apiKey: 'TU_API_KEY_AQUI',
  
  // Configuraciones de la app
  appName: 'Re-Mindly',
  version: '1.0.0'
}; 