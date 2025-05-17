import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class RegisterPage {
  email = '';
  password = '';

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async register() {
    try {
      await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      alert('¡Usuario registrado con éxito!');
      this.router.navigate(['/home']);  // Cambia '/home' por tu ruta destino
    } catch (error: any) {
      alert('Error en el registro: ' + error.message);
    }
  }
}
