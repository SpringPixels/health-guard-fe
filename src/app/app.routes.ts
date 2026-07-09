import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoverageComponent } from './coverage/coverage.component';
import { guestGuard, loggedInGuard, calculatorResultsGuard, adminGuard } from './app.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'coverage', component: CoverageComponent },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'contact', loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent) },
  { path: 'calculator', loadComponent: () => import('./calculator/calculator.component').then(m => m.CalculatorComponent), canActivate: [loggedInGuard] },
  { path: 'calculator/results', loadComponent: () => import('./calculator/calculator-results.component').then(m => m.CalculatorResultsComponent), canActivate: [calculatorResultsGuard, loggedInGuard] },
  { path: 'predictions', loadComponent: () => import('./predictions/predictions.component').then(m => m.PredictionsComponent), canActivate: [loggedInGuard] },
  { path: 'activities', loadComponent: () => import('./activities/activities.component').then(m => m.ActivitiesComponent), canActivate: [loggedInGuard] },
  { path: 'payment', loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent), canActivate: [loggedInGuard] },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./admin/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'predictions', loadComponent: () => import('./admin/admin-predictions.component').then(m => m.AdminPredictionsComponent) },
      { path: 'contact-us', loadComponent: () => import('./admin/admin-contact.component').then(m => m.AdminContactComponent) }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
