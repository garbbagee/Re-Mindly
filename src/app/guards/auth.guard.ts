import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Obtenemos el usuario actual
  const user = auth.currentUser;

  if (user) {
    // Si hay usuario, dejamos pasar
    return true;
  } else {
    // Si no hay usuario, redirigimos al login
    await router.navigate(['/login']);
    return false;
  }
};
