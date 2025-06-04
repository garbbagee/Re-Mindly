import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, NgIf], // <-- acá NgIf agregado
  standalone: true,
})
export class HomePage {
  showButton = false;

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.showButton = true;
    }, 1500);
  }

  continuar() {
    this.router.navigate(['/login']);
  }
}
