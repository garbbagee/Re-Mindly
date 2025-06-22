import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions, PermissionStatus, Channel } from '@capacitor/local-notifications';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private router: Router) { }

  async initialize() {
    if (Capacitor.getPlatform() === 'android') {
      await this.createDefaultChannel();
    }
  }

  async createDefaultChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'reminders_channel',
        name: 'Recordatorios',
        description: 'Notificaciones de tareas pendientes',
        importance: 5,
        sound: 'default',
        visibility: 1,
        vibration: true,
      });
    } catch (error) {
      console.error('Error creating notification channel', error);
    }
  }

  async hasPermissions(): Promise<boolean> {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const status: PermissionStatus = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    }
    return Notification.permission === 'granted';
  }

  async requestPermissions(): Promise<boolean> {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const status: PermissionStatus = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleNotification(title: string, body: string, scheduleAt: Date, taskId: string) {
    if (!(await this.hasPermissions())) {
      if (!(await this.requestPermissions())) {
        console.error('Notification permissions not granted.');
        return;
      }
    }

    const options: ScheduleOptions = {
      notifications: [
        {
          id: new Date().getTime(),
          title,
          body,
          schedule: { at: scheduleAt },
          channelId: 'reminders_channel',
          sound: 'default',
          actionTypeId: 'TASK_ACTIONS',
          extra: { taskId }
        }
      ]
    };

    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      try {
        await LocalNotifications.schedule(options);
      } catch (error) {
        console.error('Error scheduling notification with Capacitor', error);
      }
    } else if ('Notification' in window) {
      const now = new Date().getTime();
      const timeToNotification = scheduleAt.getTime() - now;
      if (timeToNotification > 0) {
        setTimeout(() => {
          const notification = new Notification(title, { body, data: { taskId } });
          notification.onclick = () => {
            this.router.navigate(['/feed']);
          };
        }, timeToNotification);
      }
    }
  }

  async cancelAllNotifications() {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    }
  }
} 