import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule],
  template: `
    <div class="admin-container">
      <h2>Admin Panel</h2>
      <nav mat-tab-nav-bar [tabPanel]="tabPanel">
        <a mat-tab-link 
           routerLink="/admin/dashboard" 
           routerLinkActive #rla1="routerLinkActive" 
           [active]="rla1.isActive">
          Dashboard
        </a>
        <a mat-tab-link 
           routerLink="/admin/users" 
           routerLinkActive #rla2="routerLinkActive" 
           [active]="rla2.isActive">
          Users
        </a>
        <a mat-tab-link 
           routerLink="/admin/predictions" 
           routerLinkActive #rla3="routerLinkActive" 
           [active]="rla3.isActive">
          Predictions
        </a>
        <a mat-tab-link 
           routerLink="/admin/contact-us" 
           routerLinkActive #rla4="routerLinkActive" 
           [active]="rla4.isActive">
          Contact Messages
        </a>
      </nav>
      <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
      
      <div class="admin-content" style="padding-top: 20px;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AdminComponent {}
