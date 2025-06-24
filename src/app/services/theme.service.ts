import { Injectable } from '@angular/core';

export type ProgressBarPalette = 'default' | 'fria' | 'calida';

const PROGRESS_PALETTES: Record<ProgressBarPalette, { completed: string; pending: string; overdue: string; }> = {
  default: {
    completed: '#2fdf75', // verde
    pending: '#ffd134',   // amarillo
    overdue: '#ff4961',   // rojo
  },
  fria: {
    completed: '#4285f4', // azul
    pending: '#00bcd4',   // celeste
    overdue: '#e53935',   // rojo frío
  },
  calida: {
    completed: '#ff9800', // naranja
    pending: '#e040fb',   // rosa
    overdue: '#795548',   // marrón
  },
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly PALETTE_KEY = 'progress-palette';

  constructor() {
    this.loadTheme();
  }

  setDarkMode(isDark: boolean) {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem(this.THEME_KEY, 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem(this.THEME_KEY, 'light');
    }
  }

  toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    this.setDarkMode(!isDark);
  }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark');
  }

  loadTheme() {
    const theme = localStorage.getItem(this.THEME_KEY);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  setProgressBarPalette(palette: ProgressBarPalette) {
    localStorage.setItem(this.PALETTE_KEY, palette);
  }

  getProgressBarPalette(): ProgressBarPalette {
    return (localStorage.getItem(this.PALETTE_KEY) as ProgressBarPalette) || 'default';
  }

  getProgressBarColors() {
    return PROGRESS_PALETTES[this.getProgressBarPalette()];
  }
} 