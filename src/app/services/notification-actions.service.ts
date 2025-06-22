import { Injectable, NgZone } from '@angular/core';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { Router } from '@angular/router';
import { TasksService } from './tasks.service';
import { NotificationsService } from './notifications.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationActionsService {

  constructor(
    private zone: NgZone,
    private router: Router,
    private tasksService: TasksService,
    private notificationsService: NotificationsService
  ) { }

  public initialize() {
    LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'TASK_ACTIONS',
          actions: [
            { id: 'complete', title: 'Listo' },
            { id: 'snooze', title: 'Pospone 1 Hora' },
            { id: 'cancel', title: 'Cancelar Tarea' }
          ]
        }
      ]
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction: ActionPerformed) => {
      this.zone.run(async () => {
        const { actionId, notification } = notificationAction;
        const taskId = notification.extra?.taskId;

        if (!taskId) {
          console.error("Notification action received without a taskId");
          return;
        }
        
        const task = await firstValueFrom(this.tasksService.getTask(taskId));
        if (!task) {
          console.error(`Task with id ${taskId} not found.`);
          return;
        }

        if (actionId === 'tap') {
          this.router.navigate(['/feed']);
        } else if (actionId === 'complete') {
          await this.tasksService.updateTask(taskId, { status: 'completed' });
          console.log(`Task ${taskId} marked as complete.`);
        } else if (actionId === 'snooze') {
          const snoozeDate = new Date(Date.now() + 60 * 60 * 1000);
          if(snoozeDate < task.dueDate.toDate()) {
            await this.notificationsService.scheduleNotification(
              '¡Tarea Pospuesta!',
              `Recuerda: ${task.title}`,
              snoozeDate,
              taskId
            );
            console.log(`Task ${taskId} snoozed for 1 hour.`);
          } else {
             console.log(`Snooze canceled for task ${taskId}, due date is too soon.`);
          }
        } else if (actionId === 'cancel') {
          await this.tasksService.updateTask(taskId, { status: 'cancelled' });
          console.log(`Task ${taskId} was cancelled.`);
        }
      });
    });
  }
} 