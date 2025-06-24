import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ProgressBarPalette } from '../services/theme.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personalizacion',
  templateUrl: './personalizacion.page.html',
  styleUrls: ['./personalizacion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonRadioGroup, IonRadio],
})
export class PersonalizacionPage {
  paletas: { key: ProgressBarPalette, nombre: string, colores: string[] }[] = [
    { key: 'default', nombre: 'Clásica (Verde/Amarillo/Rojo)', colores: ['#2fdf75', '#ffd134', '#ff4961'] },
    { key: 'fria', nombre: 'Fría (Azul/Celeste/Rojo)', colores: ['#4285f4', '#00bcd4', '#e53935'] },
    { key: 'calida', nombre: 'Cálida (Naranja/Rosa/Marrón)', colores: ['#ff9800', '#e040fb', '#795548'] },
  ];

  seleccionada: ProgressBarPalette;

  constructor(private themeService: ThemeService, private router: Router) {
    this.seleccionada = this.themeService.getProgressBarPalette();
  }

  cambiarPaleta(paleta: ProgressBarPalette) {
    this.seleccionada = paleta;
    this.themeService.setProgressBarPalette(paleta);
    this.router.navigate(['/feed']);
  }
} 