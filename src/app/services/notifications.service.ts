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

  private isWeb = false;

  constructor(private platform: Platform) {
    this.isWeb = this.platform.is('desktop') || this.platform.is('mobileweb');
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    if (this.isWeb) {
      // En web, usar la API de notificaciones del navegador
      await this.initializeWebNotifications();
    } else {
      // En dispositivos móviles, usar Capacitor
      await this.initializeCapacitorNotifications();
    }
  }

  private async initializeWebNotifications() {
    try {
      // Solicitar permisos para notificaciones web
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Permisos de notificación web:', permission);
      }
    } catch (error) {
      console.error('Error al solicitar permisos web:', error);
    }
  }

  private async initializeCapacitorNotifications() {
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
      if (this.isWeb) {
        return this.scheduleWebNotification(reminder);
      } else {
        return this.scheduleCapacitorNotification(reminder);
      }
    } catch (error) {
      console.error('Error al programar notificación:', error);
      return false;
    }
  }

  private async scheduleWebNotification(reminder: any): Promise<boolean> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const timeUntilNotification = reminder.scheduledTime.getTime() - Date.now();
        
        if (timeUntilNotification > 0) {
          setTimeout(() => {
            new Notification(reminder.title, {
              body: reminder.description,
              icon: '/assets/icon/favicon.png',
              tag: `reminder-${reminder.id}`
            });
          }, timeUntilNotification);
          
          console.log(`Notificación web programada para: ${reminder.title} a las ${reminder.scheduledTime}`);
          return true;
        } else {
          // Si la hora ya pasó, mostrar inmediatamente
          new Notification(reminder.title, {
            body: reminder.description,
            icon: '/assets/icon/favicon.png',
            tag: `reminder-${reminder.id}`
          });
          return true;
        }
      } else {
        console.warn('Notificaciones web no disponibles o no permitidas');
        return false;
      }
    } catch (error) {
      console.error('Error al programar notificación web:', error);
      return false;
    }
  }

  private async scheduleCapacitorNotification(reminder: any): Promise<boolean> {
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
      console.error('Error al programar notificación Capacitor:', error);
      return false;
    }
  }

  /**
   * Muestra una notificación inmediata (para pruebas)
   */
  async showImmediateNotification(title: string, body: string): Promise<boolean> {
    try {
      if (this.isWeb) {
        return this.showWebNotification(title, body);
      } else {
        return this.showCapacitorNotification(title, body);
      }
    } catch (error) {
      console.error('Error al mostrar notificación inmediata:', error);
      return false;
    }
  }

  private async showWebNotification(title: string, body: string): Promise<boolean> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/assets/icon/favicon.png'
        });
        return true;
      } else {
        console.warn('Notificaciones web no disponibles o no permitidas');
        return false;
      }
    } catch (error) {
      console.error('Error al mostrar notificación web:', error);
      return false;
    }
  }

  private async showCapacitorNotification(title: string, body: string): Promise<boolean> {
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
      console.error('Error al mostrar notificación Capacitor:', error);
      return false;
    }
  }

  /**
   * Cancela una notificación específica
   */
  async cancelNotification(notificationId: number): Promise<boolean> {
    try {
      if (this.isWeb) {
        // En web, no podemos cancelar notificaciones programadas fácilmente
        console.log('Cancelación de notificaciones web no implementada');
        return true;
      } else {
        await LocalNotifications.cancel({
          notifications: [{ id: notificationId }]
        });
        console.log(`Notificación ${notificationId} cancelada`);
        return true;
      }
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
      if (this.isWeb) {
        console.log('Cancelación de todas las notificaciones web no implementada');
        return true;
      } else {
        const pendingNotifications = await this.getScheduledNotifications();
        if (pendingNotifications.length > 0) {
          const notificationIds = pendingNotifications.map(n => ({ id: n.id }));
          await LocalNotifications.cancel({
            notifications: notificationIds
          });
        }
        console.log('Todas las notificaciones canceladas');
        return true;
      }
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
      if (this.isWeb) {
        console.log('Obtener notificaciones programadas no disponible en web');
        return [];
      } else {
        const result = await LocalNotifications.getPending();
        return result.notifications || [];
      }
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
      if (this.isWeb) {
        return 'Notification' in window && Notification.permission === 'granted';
      } else {
        const result = await LocalNotifications.checkPermissions();
        return result.display === 'granted';
      }
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Solicita permisos de notificación
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.isWeb) {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      } else {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }
} 