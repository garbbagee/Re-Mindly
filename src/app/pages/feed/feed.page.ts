import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage {
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
