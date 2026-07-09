import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard-grid" *ngIf="!isLoading(); else loading">
      <!-- KPI Cards -->
      <mat-card class="kpi-card">
        <mat-card-header>
          <mat-card-title>Total Revenue</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2>{{ dashboardData()?.total_revenue | currency:'INR' }}</h2>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card">
        <mat-card-header>
          <mat-card-title>Total Users</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2>{{ dashboardData()?.total_users }}</h2>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card">
        <mat-card-header>
          <mat-card-title>New Users (This Month)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2>{{ dashboardData()?.new_users_this_month }}</h2>
        </mat-card-content>
      </mat-card>

      <!-- Segment Breakdown -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Segment Breakdown</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <ul>
            <li *ngFor="let entry of getSegmentEntries()">
              <strong>{{ entry.key }}:</strong> {{ entry.value }} users
            </li>
          </ul>
        </mat-card-content>
      </mat-card>

      <!-- Revenue Trend -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Revenue Trend (Last 6 months)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <ul>
            <li *ngFor="let point of dashboardData()?.revenue_trend">
              <strong>{{ point.month }}:</strong> {{ point.amount | currency:'INR' }}
            </li>
          </ul>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #loading>
      <div class="spinner-container">
        <mat-spinner></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .kpi-card h2 {
      font-size: 2.5rem;
      margin: 10px 0;
      color: #3f51b5;
    }
    .chart-card {
      grid-column: 1 / -1;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 50px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  
  dashboardData = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.http.get(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.isLoading.set(false);
      }
    });
  }

  getSegmentEntries() {
    const data = this.dashboardData();
    if (!data || !data.segment_breakdown) return [];
    return Object.entries(data.segment_breakdown).map(([key, value]) => ({ key, value }));
  }
}
