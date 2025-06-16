import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage {
  userName = 'Miguel Román'; // ← cámbialo por el nombre real desde AuthService si quieres
  get userInitial() {
    return this.userName.charAt(0).toUpperCase();
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private menuCtrl: MenuController
  ) {}

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }
}
