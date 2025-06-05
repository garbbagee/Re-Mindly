import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  error: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  async login() {
    this.error = '';

    try {
      await this.authService.login(this.email, this.password);
      // ✅ Redirige al feed si login correcto
      await this.router.navigate(['/feed']);
    } catch (err: any) {
      this.error = err.message || 'Correo o contraseña incorrectos';
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
