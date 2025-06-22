import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationActionsService {

  private isWeb = false;

  constructor(private platform: Platform) {
    this.isWeb = this.platform.is('desktop') || this.platform.is('mobileweb');
    this.registerNotificationActions();
  }

  /**
   * Registra las acciones de notificación disponibles
   */
  private async registerNotificationActions() {
    // Solo registrar acciones en dispositivos móviles, no en web
    if (this.isWeb) {
      console.log('Acciones de notificación no disponibles en web');
      return;
    }

    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'REMINDER_ACTIONS',
            actions: [
              {
                id: 'COMPLETE',
                title: 'Completado'
              },
              {
                id: 'CANCEL',
                title: 'Cancelar'
              }
            ]
          }
        ]
      });
      console.log('Acciones de notificación registradas');
    } catch (error) {
      console.error('Error al registrar acciones de notificación:', error);
    }
  }
} 