import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiErrorService } from '../api-error.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatSnackBarModule],
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

      <!-- Paid Members -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Paid Members</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="members-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Total Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let member of dashboardData()?.paid_members">
                <td>#{{ member.user_id }}</td>
                <td>{{ member.email }}</td>
                <td><strong>{{ member.total_paid | currency:'INR' }}</strong></td>
              </tr>
              <tr *ngIf="!dashboardData()?.paid_members?.length">
                <td colspan="3" class="empty-state">No paid members yet.</td>
              </tr>
            </tbody>
          </table>
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
    .members-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .members-table th, .members-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .members-table th {
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
    }
    .members-table td strong {
      color: #15803d;
    }
    .empty-state {
      text-align: center !important;
      color: #94a3b8;
      padding: 30px !important;
    }
  `]
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiError = inject(ApiErrorService);

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
        const msg = this.apiError.getMessage(err, 'Failed to load dashboard data.');
        console.error('Failed to load dashboard data', err);
        this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'snack-error' });
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
