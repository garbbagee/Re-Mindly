import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  confirmPassword = '';
  error: string | null = null;

  async register() {
    this.error = null;

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.authService.register(this.email, this.password);
      // Al registrar, redirige a login
      await this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err.message || 'Error al registrarse';
    }
  }
}
