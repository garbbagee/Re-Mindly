import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationsService } from './services/notifications.service';
import { NotificationActionsService } from './services/notification-actions.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private notificationsService: NotificationsService,
    private notificationActionsService: NotificationActionsService
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    // Verificar permisos de notificación al iniciar la app
    const notificationsEnabled = await this.notificationsService.areNotificationsEnabled();
    console.log('Notificaciones habilitadas:', notificationsEnabled);
  }
}
