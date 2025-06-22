import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { MenuController, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, IonModal, IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, ToastController, LoadingController, AlertController, IonMenu, IonListHeader } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TasksService, Task } from '../services/tasks.service';
import { NotificationsService } from '../services/notifications.service';
import { trash, checkmarkCircle, add, logOutOutline, reorderTwoOutline, optionsOutline, timeOutline, notificationsOutline, ellipseOutline, closeCircleOutline } from 'ionicons/icons';
import { Timestamp } from 'firebase/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, IonModal, IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, IonMenu, IonListHeader, DatePipe ],
})
export class FeedPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;
  
  groupedTasks: { [key: string]: Task[] } = {};
  taskGroups: string[] = [];

  taskForm: FormGroup;
  isEditMode = false;
  isModalOpen = false;
  currentTaskId: string | null = null;
  private tasksSubscription!: Subscription;

  priorityColorMap: { [key in 'high' | 'medium' | 'low']: string } = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  };

  notificationPermissionGranted = true;

  constructor(
    private authService: AuthService,
    private tasksService: TasksService,
    private notificationsService: NotificationsService,
    private router: Router,
    private fb: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private menuCtrl: MenuController
  ) {
    addIcons({ trash, checkmarkCircle, add, logOutOutline, reorderTwoOutline, optionsOutline, timeOutline, notificationsOutline, ellipseOutline, closeCircleOutline });
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['medium', Validators.required],
      dueDate: [new Date().toISOString(), Validators.required]
    });
  }

  async ngOnInit() {
    // Solicitar permisos de notificación al iniciar
    this.notificationPermissionGranted = await this.notificationsService.requestPermissions();
    if (!this.notificationPermissionGranted) {
      this.showToast('Permiso de notificaciones denegado. Actívalo en los ajustes del sistema.', 'danger');
    }
    this.tasksSubscription = this.tasksService.getTasks().subscribe(tasks => {
      this.groupTasks(tasks.sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis()));
    });
  }

  private groupTasks(tasks: Task[]) {
    this.groupedTasks = {}; // Reset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    for (const task of tasks) {
      if (task.status === 'completed') continue; // Opcional: no mostrar completadas en grupos
      
      const dueDate = task.dueDate.toDate();
      dueDate.setHours(0, 0, 0, 0);

      let groupKey: string;

      if (dueDate.getTime() < today.getTime()) {
        groupKey = 'Atrasadas';
      } else if (dueDate.getTime() === today.getTime()) {
        groupKey = 'Hoy';
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groupKey = 'Mañana';
      } else {
        groupKey = 'Próximamente';
      }
      
      if (!this.groupedTasks[groupKey]) {
        this.groupedTasks[groupKey] = [];
      }
      this.groupedTasks[groupKey].push(task);
    }
    this.taskGroups = ['Atrasadas', 'Hoy', 'Mañana', 'Próximamente'].filter(g => this.groupedTasks[g]?.length > 0);
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  async logout() {
    await this.menuCtrl.close();
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async testNotification() {
    await this.menuCtrl.close();
    if (!this.notificationPermissionGranted) {
      await this.showToast('No tienes permiso para notificaciones.', 'danger');
      return;
    }
    try {
      await this.notificationsService.scheduleNotification(
        '🔔 Notificación de Prueba',
        '¡Si puedes leer esto, las notificaciones funcionan!',
        new Date(Date.now() + 5 * 1000),
        'test-task-id'
      );
      await this.showToast('Notificación de prueba programada en 5 segundos.');
    } catch (e) {
      await this.showToast('Error al programar la notificación', 'danger');
      console.error(e);
    }
  }

  openNewTaskModal() {
    this.isEditMode = false;
    this.currentTaskId = null;
    this.taskForm.reset({
      priority: 'medium',
      dueDate: new Date().toISOString()
    });
    this.isModalOpen = true;
  }

  openEditTaskModal(task: Task) {
    this.isEditMode = true;
    this.currentTaskId = task.id!;
    this.taskForm.setValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.toDate().toISOString()
    });
    this.isModalOpen = true;
  }

  async deleteTask(taskId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingController.create();
            await loading.present();
            try {
              await this.tasksService.deleteTask(taskId);
              await this.showToast('Tarea eliminada con éxito');
            } catch (error) {
              await this.showToast('Error al eliminar la tarea', 'danger');
            } finally {
              loading.dismiss();
            }
          },
        },
      ],
    });
    await alert.present();
  }
  
  async toggleStatus(task: Task) {
    if (task.status === 'cancelled') {
      await this.showToast('No se puede cambiar el estado de una tarea cancelada.', 'warning');
      return;
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const loading = await this.loadingController.create();
    await loading.present();
    try {
      await this.tasksService.updateTask(task.id!, { status: newStatus });
      const message = newStatus === 'completed' ? 'Tarea completada' : 'Tarea marcada como pendiente';
      await this.showToast(message);
    } catch (error) {
      await this.showToast('Error al actualizar la tarea', 'danger');
    } finally {
      loading.dismiss();
    }
  }
  
  cancelModal() {
    this.isModalOpen = false;
  }
  
  async confirmModal() {
    if (this.taskForm.invalid) {
      return;
    }
    const loading = await this.loadingController.create();
    await loading.present();

    const formValue = this.taskForm.value;

    try {
      if (this.isEditMode && this.currentTaskId) {
        const dueDate = new Date(formValue.dueDate);
        const taskDataToUpdate: Partial<Task> = {
          ...formValue,
          dueDate: Timestamp.fromDate(dueDate)
        };
        await this.tasksService.updateTask(this.currentTaskId, taskDataToUpdate);
        await this.showToast('Tarea actualizada con éxito');
      } else {
        const dueDate = new Date(formValue.dueDate);
        const taskDataToAdd = {
          ...formValue,
          dueDate: dueDate
        };
        const docRef = await this.tasksService.addTask(taskDataToAdd);
        await this.notificationsService.scheduleNotification(
          '¡Tarea pendiente!',
          `Tienes una nueva tarea: ${formValue.title}`,
          dueDate,
          docRef.id
        );
        await this.showToast('Tarea creada con éxito');
      }
      this.isModalOpen = false;
    } catch (error) {
      console.error('Error confirming modal:', error);
      const message = this.isEditMode ? 'Error al actualizar la tarea' : 'Error al crear la tarea';
      await this.showToast(message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}