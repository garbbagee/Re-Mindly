import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, user => {
      this.userSubject.next(user);
    });
  }

  login(email: string, password: string): Promise<User> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(res => {
        this.userSubject.next(res.user);
        return res.user;
      });
  }

  register(email: string, password: string): Promise<User> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(res => {
        this.userSubject.next(res.user);
        return res.user;
      });
  }

  logout(): Promise<void> {
    return signOut(this.auth).then(() => {
      this.userSubject.next(null);
    });
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
}
