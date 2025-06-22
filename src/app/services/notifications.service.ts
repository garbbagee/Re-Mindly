import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

export interface ReminderNotification {
  id: number;
  title: string;
  body: string;
  scheduledTime: Date;
  completed: boolean;
  cancelled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private platform: Platform) {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    // Solicitar permisos de notificación
    try {
      const permission = await LocalNotifications.requestPermissions();
      console.log('Permisos de notificación:', permission);
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }

    // Configurar listeners para acciones de notificación
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Acción de notificación realizada:', notification);
      this.handleNotificationAction(notification);
    });

    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notificación recibida:', notification);
    });
  }

  /**
   * Programa una nueva notificación de recordatorio
   */
  async scheduleReminder(reminder: {
    id: number;
    title: string;
    description: string;
    scheduledTime: Date;
  }): Promise<boolean> {
    try {
      const notification = {
        id: reminder.id,
        title: reminder.title,
        body: reminder.description,
        schedule: {
          at: reminder.scheduledTime
        },
        sound: 'default',
        actionTypeId: 'REMINDER_ACTIONS',
        extra: {
          reminderId: reminder.id,
          scheduledTime: reminder.scheduledTime.toISOString()
        }
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log(`Notificación programada para: ${reminder.title} a las ${reminder.scheduledTime}`);
      return true;
    } catch (error) {
      console.error('Error al programar notificación:', error);
      return false;
    }
  }

  /**
   * Muestra una notificación inmediata (para pruebas)
   */
  async showImmediateNotification(title: string, body: string): Promise<boolean> {
    try {
      const notification = {
        id: Date.now(),
        title: title,
        body: body,
        sound: 'default',
        actionTypeId: 'REMINDER_ACTIONS',
        extra: {
          immediate: true
        }
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      return true;
    } catch (error) {
      console.error('Error al mostrar notificación inmediata:', error);
      return false;
    }
  }

  /**
   * Cancela una notificación específica
   */
  async cancelNotification(notificationId: number): Promise<boolean> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
      console.log(`Notificación ${notificationId} cancelada`);
      return true;
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
      return false;
    }
  }

  /**
   * Cancela todas las notificaciones
   */
  async cancelAllNotifications(): Promise<boolean> {
    try {
      // Obtener todas las notificaciones programadas y cancelarlas
      const pendingNotifications = await this.getScheduledNotifications();
      if (pendingNotifications.length > 0) {
        const notificationIds = pendingNotifications.map(n => ({ id: n.id }));
        await LocalNotifications.cancel({
          notifications: notificationIds
        });
      }
      console.log('Todas las notificaciones canceladas');
      return true;
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
      return false;
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      const result = await LocalNotifications.getPending();
      return result.notifications || [];
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  /**
   * Maneja las acciones de las notificaciones (Completado/Cancelar)
   */
  private handleNotificationAction(notification: any) {
    const actionId = notification.actionId;
    const reminderId = notification.notification.extra?.reminderId;

    switch (actionId) {
      case 'COMPLETE':
        this.markAsCompleted(reminderId);
        break;
      case 'CANCEL':
        this.cancelReminder(reminderId);
        break;
      default:
        console.log('Acción no reconocida:', actionId);
    }
  }

  /**
   * Marca un recordatorio como completado
   */
  private markAsCompleted(reminderId: number) {
    console.log(`Recordatorio ${reminderId} marcado como completado`);
    // Aquí puedes integrar con tu servicio de tareas para actualizar el estado
    // this.tasksService.markAsCompleted(reminderId);
  }

  /**
   * Cancela un recordatorio
   */
  private cancelReminder(reminderId: number) {
    console.log(`Recordatorio ${reminderId} cancelado`);
    // Aquí puedes integrar con tu servicio de tareas para cancelar el recordatorio
    // this.tasksService.cancelReminder(reminderId);
  }

  /**
   * Verifica si las notificaciones están habilitadas
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }
} 