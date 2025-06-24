import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'feed',
    loadComponent: () => import('./feed/feed.page').then((m) => m.FeedPage),
    canActivate: [authGuard]
  },
  {
    path: 'home',
    redirectTo: 'feed',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full',
  },
  {
    path: 'personalizacion',
    loadComponent: () => import('./personalizacion/personalizacion.page').then(m => m.PersonalizacionPage)
  },
];
