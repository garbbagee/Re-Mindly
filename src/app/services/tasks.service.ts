import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, deleteDoc, Timestamp, DocumentReference, docData } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'cancelled';
  userId: string;
  createdAt: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private firestore: Firestore, private authService: AuthService) { }

  private async getCurrentUser(): Promise<User> {
    const user = await firstValueFrom(this.authService.getAuthState());
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  async addTask(taskData: { title: string; description: string; dueDate: Date; priority: 'high' | 'medium' | 'low'; }): Promise<DocumentReference> {
    const user = await this.getCurrentUser();
    const tasksCollection = collection(this.firestore, 'tasks');
    return addDoc(tasksCollection, {
      ...taskData,
      dueDate: Timestamp.fromDate(taskData.dueDate),
      userId: user.uid,
      createdAt: Timestamp.now(),
      status: 'pending'
    });
  }

  getTasks(): Observable<Task[]> {
    return this.authService.getAuthState().pipe(
      switchMap(user => {
        if (user) {
          const tasksCollection = collection(this.firestore, 'tasks');
          const q = query(tasksCollection, where('userId', '==', user.uid));
          return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
        } else {
          return new Observable<Task[]>(subscriber => subscriber.next([]));
        }
      })
    );
  }

  getTask(taskId: string): Observable<Task | null> {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return docData(taskDocRef, { idField: 'id' }) as Observable<Task | null>;
  }

  updateTask(taskId: string, taskData: Partial<Task>): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    const dataToUpdate = { ...taskData };
    if (dataToUpdate.dueDate && !(dataToUpdate.dueDate instanceof Timestamp)) {
        dataToUpdate.dueDate = Timestamp.fromDate(dataToUpdate.dueDate as any);
    }
    if ('completed' in dataToUpdate) {
      delete (dataToUpdate as any).completed;
    }
    delete dataToUpdate.id;
    return updateDoc(taskDocRef, dataToUpdate as any);
  }

  deleteTask(taskId: string): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDocRef);
  }
} 