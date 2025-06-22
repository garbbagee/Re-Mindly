import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationActionsService } from './services/notification-actions.service';
import { NotificationsService } from './services/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private notificationActions: NotificationActionsService,
    private notificationsService: NotificationsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.notificationsService.initialize();
    this.notificationActions.initialize();
  }
}
