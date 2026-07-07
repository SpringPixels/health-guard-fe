import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoverageComponent } from './coverage/coverage.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'coverage', component: CoverageComponent },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register) },
];
