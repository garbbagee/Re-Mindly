import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-start',
  template: `
    <ion-content class="ion-padding" fullscreen>
      <ion-spinner name="crescent"></ion-spinner>
      <p>Verificando sesión...</p>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule]
})
export class StartPage implements OnInit {

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit() {
    this.afAuth.onAuthStateChanged(user => {
      if (user) {
        this.router.navigateByUrl('/home');
      } else {
        this.router.navigateByUrl('/login');
      }
    });
  }
}
