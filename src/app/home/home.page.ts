import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(
  private afAuth: AngularFireAuth,
  private router: Router
) {}

logout() {
  this.afAuth.signOut().then(() => {
    this.router.navigate(['/login']);
  });
}


  
}
