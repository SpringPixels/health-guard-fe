import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Coverage } from './coverage/coverage';
import { guestGuard, loggedInGuard, calculatorResultsGuard, adminGuard, paidGuard } from './app.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home, title: "Health Guard | Home" },
  { path: 'coverage', component: Coverage, title: "Health Guard | Coverage" },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login), canActivate: [guestGuard], title: "Health Guard | Login" },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register), canActivate: [guestGuard], title: "Health Guard | Register" },
  { path: 'contact', loadComponent: () => import('./contact/contact').then(m => m.Contact), title: "Health Guard | Contact" },
  { path: 'calculator', loadComponent: () => import('./calculator/calculator').then(m => m.Calculator), canActivate: [loggedInGuard], title: "Health Guard | Calculator" },
  { path: 'calculator/results', loadComponent: () => import('./calculator/calculator-results').then(m => m.CalculatorResults), canActivate: [calculatorResultsGuard, loggedInGuard], title: "Health Guard | Calculator Results" },
  { path: 'predictions', loadComponent: () => import('./predictions/predictions').then(m => m.Predictions), canActivate: [loggedInGuard], title: "Health Guard | Predictions" },
  { path: 'activities', loadComponent: () => import('./activities/activities').then(m => m.Activities), canActivate: [loggedInGuard, paidGuard], title: "Health Guard | Activities" },
  { path: 'payment', loadComponent: () => import('./payment/payment').then(m => m.Payment), canActivate: [loggedInGuard], title: "Health Guard | Payment" },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.Admin),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/admin-dashboard').then(m => m.AdminDashboard), title: "Health Guard | Admin Dashboard" },
      { path: 'users', loadComponent: () => import('./admin/admin-users').then(m => m.AdminUsers), title: "Health Guard | Admin Users" },
      { path: 'predictions', loadComponent: () => import('./admin/admin-predictions').then(m => m.AdminPredictions), title: "Health Guard | Admin Predictions" },
      { path: 'contact-us', loadComponent: () => import('./admin/admin-contact').then(m => m.AdminContact), title: "Health Guard | Admin Contact" }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
