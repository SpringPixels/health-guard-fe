import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { CalculatorStateService } from './calculator/calculator-state.service';

// Guard to protect routes that require the user to be logged in
export const loggedInGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;
  
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

// Guard to prevent logged in users from accessing login/register pages
export const guestGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/');
};

// Guard to protect the calculator results page
export const calculatorResultsGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  const state = inject(CalculatorStateService);
  const router = inject(Router);

  if (state.prediction() !== null) {
    return true;
  }
  return router.parseUrl('/calculator');
};

// Guard to protect admin-only routes
export const adminGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }
  return router.parseUrl('/');
};
