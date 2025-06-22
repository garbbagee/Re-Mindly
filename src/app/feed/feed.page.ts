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
import { OverlayEventDetail } from '@ionic/core/components';

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
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: 'Prueba básica',
            body: 'Esto es una notificación local simple',
            schedule: { at: new Date(Date.now() + 5000) },
          }
        ]
      });
      await this.showToast('Notificación básica programada en 5 segundos.');
    } catch (e) {
      await this.showToast('Error al programar la notificación', 'danger');
      console.error(e);
    }
  }

  private formatToIonicDateTime(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  openNewTaskModal() {
    this.isEditMode = false;
    this.currentTaskId = null;
    this.taskForm.reset({
      priority: 'medium',
      dueDate: this.formatToIonicDateTime(new Date())
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
      dueDate: this.formatToIonicDateTime(task.dueDate.toDate())
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
    this.modal.dismiss(null, 'cancel');
  }
  
  async confirmModal() {
    if (this.taskForm.invalid) {
      return;
    }
    const loading = await this.loadingController.create({ message: 'Guardando...' });
    await loading.present();

    const formValue = this.taskForm.value;
    const dueDate = new Date(formValue.dueDate);

    try {
      if (this.isEditMode && this.currentTaskId) {
        const taskDataToUpdate: Partial<Task> = { ...formValue, dueDate: Timestamp.fromDate(dueDate) };
        await this.tasksService.updateTask(this.currentTaskId, taskDataToUpdate);
        await this.showToast('Tarea actualizada con éxito');
        this.modal.dismiss(null, 'confirm');
      } else {
        const taskDataToAdd = { ...formValue, status: 'pending', dueDate: dueDate };
        const docRef = await this.tasksService.addTask(taskDataToAdd);
        await this.showToast('Tarea creada.');
        
        const timeDiff = dueDate.getTime() - Date.now();

        this.modal.dismiss({ 
          taskId: docRef.id, 
          timeDiff: timeDiff > 0 ? timeDiff : 0,
          title: formValue.title 
        }, 'confirm');
      }
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      await this.showToast('Error al guardar la tarea.', 'danger');
      this.modal.dismiss(null, 'error');
    } finally {
      loading.dismiss();
    }
  }

  async handleModalDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<{ taskId: string; timeDiff: number; title: string }>>;
    this.isModalOpen = false; // Close the modal in the UI

    if (ev.detail.role === 'confirm' && ev.detail.data) {
      const { timeDiff, title } = ev.detail.data;
      const scheduleDate = new Date(Date.now() + timeDiff);
      
      console.log('--- Modal Cerrado. Intentando programar con payload idéntico al de la prueba. ---');
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Math.random() * 10000), // ID simple y aleatorio
            title: '¡Recordatorio!',
            body: title,
            schedule: { at: scheduleDate }
            // Sin 'sound', para máxima compatibilidad
          }]
        });
        console.log('Notificación programada exitosamente con payload de prueba.');
        await this.showToast('Notificación programada.', 'success');
      } catch (e) {
        console.error('Falló la programación de la notificación post-modal.', e);
        await this.showToast('La notificación no pudo ser programada.', 'danger');
      }
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