import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private app = initializeApp(environment.firebaseConfig);
  private firestore = getFirestore(this.app);
  private auth = getAuth(this.app);

  getTasks(): Observable<Task[]> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      return new Observable(subscriber => subscriber.next([]));
    }
    
    const tasksRef = collection(this.firestore, 'tasks');
    
    // Consulta temporal sin orderBy para evitar el error de índice
    // Una vez que se cree el índice, puedes volver a usar orderBy
    const q = query(
      tasksRef, 
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc') // Comentado temporalmente
    );
    
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data['title'],
            description: data['description'],
            completed: data['completed'],
            createdAt: data['createdAt']?.toDate() || new Date(),
            dueDate: data['dueDate']?.toDate() || undefined,
            priority: data['priority'],
            userId: data['userId']
          } as Task;
        });
        
        // Ordenar en el cliente temporalmente
        tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        subscriber.next(tasks);
      }, (error) => {
        console.error('Error getting tasks:', error);
        subscriber.error(error);
      });

      return unsubscribe;
    });
  }

  addTask(task: Omit<Task, 'id' | 'userId'>): Promise<string> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      return Promise.reject('Usuario no autenticado');
    }
    
    const taskData = {
      ...task,
      userId,
      createdAt: Timestamp.fromDate(task.createdAt),
      dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
    };
    
    const tasksRef = collection(this.firestore, 'tasks');
    return addDoc(tasksRef, taskData).then(docRef => docRef.id);
  }

  updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    
    const updateData: any = { ...updates };
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updates.createdAt);
    }
    
    // Remover campos que no deben actualizarse
    delete updateData.id;
    delete updateData.userId;
    
    return updateDoc(taskRef, updateData);
  }

  deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    return deleteDoc(taskRef);
  }

  toggleTaskComplete(taskId: string, completed: boolean): Promise<void> {
    return this.updateTask(taskId, { completed });
  }
} 