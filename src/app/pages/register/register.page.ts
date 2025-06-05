import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async register() {
    this.error = null;

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.authService.register(this.email, this.password);
      console.log('Registro exitoso. Redirigiendo a login...');
      await this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err.message || 'Error al registrarse';
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
