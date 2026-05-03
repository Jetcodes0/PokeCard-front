import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Auth guard: redirect to /login if not authenticated
export function authGuard(): boolean {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigateByUrl('/login');
  return false;
}

export const routes: Routes = [
  {
    path:    '',
    loadComponent: () =>
      import('./components/game/game.component').then(m => m.GameComponent),
    canActivate: [authGuard],
  },
  {
    path:    'login',
    loadComponent: () =>
      import('./components/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path:      '**',
    redirectTo: '',
  },
];
