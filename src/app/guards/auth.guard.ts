import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await firstValueFrom(auth.user$); // espera el valor inicial

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
