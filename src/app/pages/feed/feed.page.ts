import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { TasksService, Task } from 'src/app/services/tasks.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit, OnDestroy {
  userName = 'Miguel Román';
  tasks: Task[] = [];
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority: 'low' | 'medium' | 'high' = 'medium';
  newTaskDueDate = '';
  isAddingTask = false;
  private tasksSubscription?: Subscription;

  get userInitial() {
    return this.userName.charAt(0).toUpperCase();
  }

  get completedTasks() {
    return this.tasks.filter(task => task.completed);
  }

  get pendingTasks() {
    return this.tasks.filter(task => !task.completed);
  }

  get overdueTasks() {
    const now = new Date();
    return this.pendingTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now
    );
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private tasksService: TasksService,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  loadTasks() {
    this.tasksSubscription = this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.showToast('Error al cargar las tareas');
      }
    });
  }

  openAddTaskModal() {
    this.isAddingTask = true;
  }

  closeAddTaskModal() {
    this.isAddingTask = false;
    // Limpiar formulario al cerrar
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskPriority = 'medium';
    this.newTaskDueDate = '';
  }

  addTask() {
    if (!this.newTaskTitle.trim()) {
      this.showToast('Por favor ingresa un título para la tarea');
      return;
    }

    const newTask = {
      title: this.newTaskTitle.trim(),
      description: this.newTaskDescription.trim(),
      completed: false,
      createdAt: new Date(),
      dueDate: this.newTaskDueDate ? new Date(this.newTaskDueDate) : undefined,
      priority: this.newTaskPriority
    };

    this.tasksService.addTask(newTask).then(() => {
      this.closeAddTaskModal();
      this.showToast('Tarea agregada exitosamente');
    }).catch(error => {
      console.error('Error adding task:', error);
      this.showToast('Error al agregar la tarea');
    });
  }

  toggleTask(task: Task) {
    this.tasksService.toggleTaskComplete(task.id, !task.completed).then(() => {
      this.showToast(task.completed ? 'Tarea marcada como pendiente' : 'Tarea completada');
    }).catch(error => {
      console.error('Error toggling task:', error);
      this.showToast('Error al actualizar la tarea');
    });
  }

  async editTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Editar tarea',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: task.title,
          placeholder: 'Título de la tarea'
        },
        {
          name: 'description',
          type: 'textarea',
          value: task.description,
          placeholder: 'Descripción (opcional)'
        },
        {
          name: 'dueDate',
          type: 'datetime-local',
          value: task.dueDate ? this.formatDateForInput(task.dueDate) : '',
          placeholder: 'Fecha de vencimiento (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.title.trim()) {
              const updates = {
                title: data.title.trim(),
                description: data.description.trim(),
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined
              };

              this.tasksService.updateTask(task.id, updates).then(() => {
                this.showToast('Tarea actualizada');
              }).catch(error => {
                console.error('Error updating task:', error);
                this.showToast('Error al actualizar la tarea');
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.tasksService.deleteTask(task.id).then(() => {
              this.showToast('Tarea eliminada');
            }).catch(error => {
              console.error('Error deleting task:', error);
              this.showToast('Error al eliminar la tarea');
            });
          }
        }
      ]
    });

    await alert.present();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  formatDateForDisplay(date: Date): string {
    const now = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Vencida hace ${Math.abs(diffDays)} día(s)`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${diffDays} días`;
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }
}
