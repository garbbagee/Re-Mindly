import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getAuthState().pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }
      
      const urlTree = router.parseUrl('/login');
      return urlTree;
    })
  );
}; 