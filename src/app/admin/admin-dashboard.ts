import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ApiErrorService } from '../api-error.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatSnackBarModule, FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiError = inject(ApiErrorService);

  dashboardData = signal<any>(null);
  pricingSettings = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.loadPricingSettings();
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

  loadPricingSettings() {
    this.http.get(`${environment.apiUrl}/admin/settings/pricing`).subscribe({
      next: (data) => this.pricingSettings.set(data),
      error: (err) => console.error('Failed to load pricing settings', err)
    });
  }

  savePricingSettings() {
    this.http.patch(`${environment.apiUrl}/admin/settings/pricing`, this.pricingSettings()).subscribe({
      next: () => this.snackBar.open('Pricing settings updated', 'Close', { duration: 3000 }),
      error: (err) => this.snackBar.open(this.apiError.getMessage(err, 'Failed to update settings'), 'Close', { duration: 5000, panelClass: 'snack-error' })
    });
  }
}
