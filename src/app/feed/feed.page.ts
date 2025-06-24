import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { MenuController, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, IonModal, IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, ToastController, LoadingController, AlertController, IonMenu, IonListHeader } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TasksService, Task } from '../services/tasks.service';
import { NotificationsService } from '../services/notifications.service';
import { trash, checkmarkCircle, add, logOutOutline, reorderTwoOutline, optionsOutline, timeOutline, notificationsOutline, ellipseOutline, closeCircleOutline, settingsOutline, exitOutline } from 'ionicons/icons';
import { Timestamp } from 'firebase/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { OverlayEventDetail } from '@ionic/core/components';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, IonModal, IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, IonMenu, IonListHeader, DatePipe ],
})
export class FeedPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild('progressCircle') progressCircle!: ElementRef<HTMLElement>;
  
  groupedTasks: { [key: string]: Task[] } = {};
  taskGroups: string[] = [];

  // Filtro de tareas: 'all', 'completed', 'pending', 'overdue'
  taskFilter: 'all' | 'completed' | 'pending' | 'overdue' = 'all';

  taskForm: FormGroup;
  isEditMode = false;
  isModalOpen = false;
  currentTaskId: string | null = null;
  public tasksSubscription!: Subscription;

  // Propiedades para el progreso diario
  dailyProgress = {
    completed: 0,
    pending: 0,
    overdue: 0,
    total: 0
  };

  priorityColorMap: { [key in 'high' | 'medium' | 'low']: string } = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  };

  notificationPermissionGranted = true;

  private lastFilter: 'completed' | 'pending' | 'overdue' = 'pending';

  showNotificationTypeSelect = false;

  constructor(
    private authService: AuthService,
    private tasksService: TasksService,
    private notificationsService: NotificationsService,
    private router: Router,
    private fb: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {
    addIcons({ trash, checkmarkCircle, add, logOutOutline, reorderTwoOutline, optionsOutline, timeOutline, notificationsOutline, ellipseOutline, closeCircleOutline, settingsOutline, exitOutline });
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      priority: ['medium', [Validators.required]],
      dueDate: ['', [Validators.required]],
      notificationType: ['repeat-today']
    });

    this.taskForm.get('dueDate')?.valueChanges.subscribe(() => {
      this.updateNotificationTypeVisibility();
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
      this.cdr.detectChanges();
      this.updateProgressCircle();
    });
  }

  ngAfterViewInit() {
    this.taskForm.get('dueDate')?.valueChanges.subscribe(() => {
      setTimeout(() => this.updateNotificationTypeVisibility(), 0);
    });
    this.updateProgressCircle();
  }

  // Función auxiliar para comparar solo año, mes y día
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  private calculateDailyProgress(tasks: Task[], today: Date) {
    const now = new Date();
    // Completadas: todas con status completed y fecha <= ahora
    const completed = tasks.filter(task => {
      const dueDate = task.dueDate.toDate();
      return dueDate <= now && task.status === 'completed';
    }).length;
    // Pendientes: todas con status pending y fecha > ahora
    const pending = tasks.filter(task => {
      const dueDate = task.dueDate.toDate();
      return dueDate > now && task.status === 'pending';
    }).length;
    // Atrasadas: todas con status pending y fecha <= ahora
    const overdue = tasks.filter(task => {
      const dueDate = task.dueDate.toDate();
      return dueDate <= now && task.status === 'pending';
    }).length;
    this.dailyProgress = {
      completed,
      pending,
      overdue,
      total: completed + pending + overdue
    };
  }

  private groupTasks(tasks: Task[]) {
    this.groupedTasks = { 'Atrasadas': [], 'Hoy': [], 'Mañana': [], 'Próximamente': [] };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const now = new Date();

    // Calcular progreso diario
    this.calculateDailyProgress(tasks, today);

    for (const task of tasks) {
      const dueDate = task.dueDate.toDate();
      const isOverdue = dueDate <= now && task.status === 'pending';
      (task as any)._isOverdue = isOverdue;

      if (isOverdue) {
        this.groupedTasks['Atrasadas'].push(task);
      } else if (this.isSameDay(dueDate, today)) {
        this.groupedTasks['Hoy'].push(task);
      } else if (this.isSameDay(dueDate, tomorrow)) {
        this.groupedTasks['Mañana'].push(task);
      } else if (dueDate > tomorrow) {
        this.groupedTasks['Próximamente'].push(task);
      }
    }
    this.taskGroups = ['Atrasadas', 'Hoy', 'Mañana', 'Próximamente'].filter(g => this.groupedTasks[g]?.length > 0);
  }

  private updateProgressCircle() {
    setTimeout(() => {
      const circle = this.progressCircle?.nativeElement;
      if (!circle) return;
      if (this.dailyProgress.total === 0) {
        circle.style.setProperty('--completed-deg', '0');
        circle.style.setProperty('--pending-deg', '0');
        circle.style.setProperty('--overdue-deg', '0');
        return;
      }
      const total = this.dailyProgress.total;
      let completedDeg = Math.round((this.dailyProgress.completed / total) * 360);
      let pendingDeg = Math.round((this.dailyProgress.pending / total) * 360);
      let overdueDeg = Math.round((this.dailyProgress.overdue / total) * 360);
      if (this.dailyProgress.completed === total) {
        completedDeg = 360; pendingDeg = 0; overdueDeg = 0;
      }
      if (this.dailyProgress.pending === total) {
        completedDeg = 0; pendingDeg = 360; overdueDeg = 0;
      }
      if (this.dailyProgress.overdue === total) {
        completedDeg = 0; pendingDeg = 0; overdueDeg = 360;
      }
      const sum = completedDeg + pendingDeg + overdueDeg;
      if (sum !== 360) {
        const diff = 360 - sum;
        const max = Math.max(completedDeg, pendingDeg, overdueDeg);
        if (completedDeg === max) completedDeg += diff;
        else if (pendingDeg === max) pendingDeg += diff;
        else overdueDeg += diff;
      }
      circle.style.setProperty('--completed-deg', completedDeg.toString());
      circle.style.setProperty('--pending-deg', pendingDeg.toString());
      circle.style.setProperty('--overdue-deg', overdueDeg.toString());
    }, 0);
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  async logout() {
    await this.notificationsService.cancelAllNotifications();
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
    const now = new Date();
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: this.formatToIonicDateTime(now),
      notificationType: 'repeat-today'
    });
    setTimeout(() => this.updateNotificationTypeVisibility(), 0);
    this.isModalOpen = true;
  }

  openEditTaskModal(task: Task) {
    this.isEditMode = true;
    this.currentTaskId = task.id!;
    const dueDate = task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate();
    this.taskForm.setValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: this.formatToIonicDateTime(dueDate),
      notificationType: task.notificationType || 'repeat-today'
    });
    setTimeout(() => this.updateNotificationTypeVisibility(), 0);
    this.isModalOpen = true;
  }

  updateNotificationTypeVisibility() {
    let dueDate = this.taskForm.value.dueDate;
    console.log('DEBUG dueDate:', dueDate);
    if (!dueDate) {
      this.showNotificationTypeSelect = false;
      return;
    }
    if (typeof dueDate === 'string') {
      dueDate = new Date(dueDate);
    }
    if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
      this.showNotificationTypeSelect = false;
      return;
    }
    const now = new Date();
    // Comparar solo la fecha (año, mes, día)
    const isDifferentDay = dueDate.getFullYear() !== now.getFullYear() ||
      dueDate.getMonth() !== now.getMonth() ||
      dueDate.getDate() !== now.getDate();
    this.showNotificationTypeSelect = isDifferentDay;
    if (!this.showNotificationTypeSelect) {
      this.taskForm.patchValue({ notificationType: 'repeat-today' });
    }
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
              await this.notificationsService.cancelAllNotifications();
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
        
        const timeDiff = dueDate.getTime() - Date.now();
        this.modal.dismiss({ 
          taskId: this.currentTaskId, 
          timeDiff: timeDiff > 0 ? timeDiff : 0,
          title: formValue.title,
          priority: formValue.priority
        }, 'confirm');
      } else {
        const taskDataToAdd = { ...formValue, status: 'pending', dueDate: dueDate };
        const docRef = await this.tasksService.addTask(taskDataToAdd);
        await this.showToast('Tarea creada.');
        
        const timeDiff = dueDate.getTime() - Date.now();

        this.modal.dismiss({ 
          taskId: docRef.id, 
          timeDiff: timeDiff > 0 ? timeDiff : 0,
          title: formValue.title,
          priority: formValue.priority
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
    const ev = event as CustomEvent<OverlayEventDetail<{ taskId: string; timeDiff: number; title: string; priority: string }>>;
    this.isModalOpen = false; // Close the modal in the UI

    if (ev.detail.role === 'confirm' && ev.detail.data) {
      const { timeDiff, title, priority } = ev.detail.data;
      const notificationType = this.taskForm.value.notificationType || 'repeat-today';
      let hoursBefore = 1;
      switch (priority) {
        case 'high': hoursBefore = 2; break;
        case 'medium': hoursBefore = 3; break;
        case 'low': hoursBefore = 4; break;
      }
      const now = new Date();
      const dueDate = new Date(now.getTime() + timeDiff);
      const notifications = [];

      // Cancelar todas las notificaciones antes de programar nuevas
      await this.notificationsService.cancelAllNotifications();

      if (notificationType === 'repeat-today') {
        // Solo programar notificaciones el día de la fecha límite
        const isToday = dueDate.toDateString() === now.toDateString();
        if (isToday) {
          // Notificaciones cada X horas desde ahora hasta la fecha límite
          for (let t = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000); t < dueDate; t = new Date(t.getTime() + hoursBefore * 60 * 60 * 1000)) {
            notifications.push({
              id: Math.floor(Math.random() * 10000),
              title: '¡Recordatorio!',
              body: title,
              schedule: { at: new Date(t) }
            });
          }
          // Notificación exacta
          notifications.push({
            id: Math.floor(Math.random() * 10000) + 1,
            title: '¡Recordatorio!',
            body: title,
            schedule: { at: dueDate }
          });
        }
      } else if (notificationType === 'repeat-days') {
        // Notificación diaria a la misma hora, solo en los días previos
        const dayMs = 24 * 60 * 60 * 1000;
        let t = new Date(dueDate.getTime() - dayMs);
        while (t > now) {
          notifications.push({
            id: Math.floor(Math.random() * 10000),
            title: '¡Recordatorio!',
            body: title,
            schedule: { at: new Date(t) }
          });
          t = new Date(t.getTime() - dayMs);
        }
        // Notificación exacta
        notifications.push({
          id: Math.floor(Math.random() * 10000) + 1,
          title: '¡Recordatorio!',
          body: title,
          schedule: { at: dueDate }
        });
      }
      if (notifications.length > 0) {
        try {
          await LocalNotifications.schedule({ notifications });
          await this.showToast('Notificaciones programadas.', 'success');
        } catch (e) {
          await this.showToast('Las notificaciones no pudieron ser programadas.', 'danger');
        }
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

  setTaskFilter(filter: 'all' | 'completed' | 'pending' | 'overdue') {
    if (filter !== 'all') {
      this.lastFilter = filter as any;
    }
    this.taskFilter = filter;
  }

  toggleFiltro() {
    if (this.taskFilter === 'all') {
      this.taskFilter = this.lastFilter;
    } else {
      this.taskFilter = 'all';
    }
  }

  shouldShowGroup(group: string): boolean {
    if (this.taskFilter === 'all') return true;
    if (this.taskFilter === 'completed') return group === 'Hoy' || group === 'Atrasadas' || group === 'Mañana' || group === 'Próximamente';
    if (this.taskFilter === 'pending') return group === 'Hoy' || group === 'Mañana' || group === 'Próximamente';
    if (this.taskFilter === 'overdue') return group === 'Atrasadas';
    return true;
  }

  isTaskVisible(task: Task): boolean {
    if (this.taskFilter === 'all') return true;
    if (this.taskFilter === 'completed') return task.status === 'completed';
    if (this.taskFilter === 'pending') return task.status === 'pending' && !(task as any)._isOverdue;
    if (this.taskFilter === 'overdue') return (task as any)._isOverdue;
    return true;
  }

  public cancelTask(taskId: string) {
    this.notificationsService.cancelAllNotifications();
    // ... (lógica existente de cancelación de la tarea)
  }

  public isOverdue(task: Task): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = task.dueDate.toDate();
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status === 'pending';
  }

  get completedPercent() {
    if (this.dailyProgress.total === 0) return 0;
    const percent = (this.dailyProgress.completed / this.dailyProgress.total) * 100;
    return this.dailyProgress.completed > 0 && percent < 4 ? 4 : percent;
  }
  get pendingPercent() {
    if (this.dailyProgress.total === 0) return 0;
    const percent = (this.dailyProgress.pending / this.dailyProgress.total) * 100;
    return this.dailyProgress.pending > 0 && percent < 4 ? 4 : percent;
  }
  get overduePercent() {
    if (this.dailyProgress.total === 0) return 0;
    // El resto para que sumen 100
    const percent = 100 - this.completedPercent - this.pendingPercent;
    return percent < 0 ? 0 : percent;
  }

  get progressColors() {
    return this.themeService.getProgressBarColors();
  }
}