import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationActionsService {

  constructor() {
    this.registerNotificationActions();
  }

  /**
   * Registra las acciones de notificación disponibles
   */
  private async registerNotificationActions() {
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