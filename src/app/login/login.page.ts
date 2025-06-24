import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, LoadingController, ToastController, IonModal, IonButtons } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton,
    IonModal,
    IonButtons,
    FormsModule
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  showResetPassword = false;
  resetEmail = '';
  resetLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    try {
      await this.authService.login(this.loginForm.value);
      loading.dismiss();
      this.router.navigateByUrl('/feed', { replaceUrl: true });
    } catch (error: any) {
      loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Email o contraseña incorrectos.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async openResetPassword() {
    this.showResetPassword = true;
    this.resetEmail = '';
  }

  async sendResetPassword() {
    if (!this.resetEmail) return;
    this.resetLoading = true;
    try {
      await this.authService.resetPassword(this.resetEmail);
      const toast = await this.toastController.create({
        message: 'Se ha enviado un enlace de recuperación a tu correo.',
        duration: 3500,
        color: 'success'
      });
      toast.present();
      this.showResetPassword = false;
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: 'No se pudo enviar el correo. Verifica el email.',
        duration: 3500,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.resetLoading = false;
    }
  }

  closeResetPassword() {
    this.showResetPassword = false;
  }
} 