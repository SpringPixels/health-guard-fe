import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiErrorService } from '../api-error.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatSelectModule, MatInputModule, MatFormFieldModule, MatCardModule, MatDividerModule, MatSnackBarModule],
  template: `
    <div class="users-container">
      <h3>Manage Users</h3>
      <table mat-table [dataSource]="users()" class="mat-elevation-z8">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> ID </th>
          <td mat-cell *matCellDef="let user"> {{user.id}} </td>
        </ng-container>

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef> Email </th>
          <td mat-cell *matCellDef="let user"> {{user.email}} </td>
        </ng-container>

        <!-- Role Column -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef> Role </th>
          <td mat-cell *matCellDef="let user">
            <mat-select [value]="user.role" (selectionChange)="updateRole(user.id, $event.value)">
              <mat-option value="user">User</mat-option>
              <mat-option value="admin">Admin</mat-option>
            </mat-select>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let user">
            <span [class.active-status]="user.is_active" [class.banned-status]="!user.is_active">
              {{ user.is_active ? 'Active' : 'Banned' }}
            </span>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let user">
            <button mat-button (click)="$event.stopPropagation(); updateStatus(user.id, !user.is_active)" [color]="user.is_active ? 'warn' : 'primary'">
              {{ user.is_active ? 'Ban' : 'Unban' }}
            </button>
            <button mat-button color="warn" (click)="$event.stopPropagation(); deleteUser(user.id)">Delete</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="analyzeUser(row.id)" class="cursor-pointer hover:bg-slate-50" [class.bg-blue-50]="selectedUserId() === row.id"></tr>
      </table>

      <!-- AI Risk Analysis Panel -->
      <mat-card *ngIf="selectedAnalysis()" class="mt-8">
        <mat-card-header>
          <mat-card-title>AI Risk Analysis: User #{{ selectedUserId() }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-slate-500">Risky Behaviour Rate</p>
              <p class="text-2xl font-bold" [ngClass]="{'text-red-600': selectedAnalysis().risky_behaviour_rate > 50, 'text-green-600': selectedAnalysis().risky_behaviour_rate <= 50}">
                {{ selectedAnalysis().risky_behaviour_rate }}%
              </p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Renewal Price Multiplier</p>
              <p class="text-2xl font-bold">{{ selectedAnalysis().renewal_multiplier }}x</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Base Premium</p>
              <p class="text-lg">{{ selectedAnalysis().base_premium | currency:'INR' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Predicted Renewal Premium</p>
              <p class="text-lg font-bold text-orange-600">{{ selectedAnalysis().predicted_renewal_premium | currency:'INR' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Total Exercises (30 days)</p>
              <p class="text-lg">{{ selectedAnalysis().total_exercises }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Total Claims Amount</p>
              <p class="text-lg">{{ selectedAnalysis().total_claims_amount | currency:'INR' }}</p>
            </div>
          </div>
          
          <mat-divider></mat-divider>
          
          <h4 class="mt-4 font-bold text-slate-700">Claims History</h4>
          <ul class="mb-6">
            <li *ngFor="let claim of selectedAnalysis().claims" class="border-b py-2 flex justify-between">
              <span>{{ claim.date }} - {{ claim.description }}</span>
              <strong class="text-red-600">{{ claim.amount | currency:'INR' }}</strong>
            </li>
            <li *ngIf="!selectedAnalysis().claims.length" class="text-slate-500 py-2">No claims filed.</li>
          </ul>

          <mat-divider></mat-divider>

          <h4 class="mt-4 font-bold text-slate-700 mb-2">Add New Claim</h4>
          <div class="flex gap-4 items-center">
            <mat-form-field appearance="outline">
              <mat-label>Amount</mat-label>
              <input matInput type="number" [(ngModel)]="newClaimAmount" placeholder="e.g. 5000">
            </mat-form-field>
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Description</mat-label>
              <input matInput [(ngModel)]="newClaimDesc" placeholder="e.g. Hospitalization">
            </mat-form-field>
            <button mat-flat-button color="warn" class="h-[56px] mb-5" (click)="addClaim()">Submit Claim</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-container {
      width: 100%;
    }
    table {
      width: 100%;
    }
    .active-status {
      color: green;
      font-weight: 500;
    }
    .banned-status {
      color: red;
      font-weight: 500;
    }
  `]
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiError = inject(ApiErrorService);

  users = signal<any[]>([]);
  displayedColumns: string[] = ['id', 'email', 'role', 'status', 'actions'];

  selectedUserId = signal<number | null>(null);
  selectedAnalysis = signal<any>(null);
  newClaimAmount: number = 0;
  newClaimDesc: string = '';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to load users'))
    });
  }

  updateRole(userId: number, newRole: string) {
    this.http.patch(`${environment.apiUrl}/admin/users/${userId}/role`, { role: newRole }).subscribe({
      next: () => this.snackBar.open('Role updated', 'Close', { duration: 3000 }),
      error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to update role'))
    });
  }

  updateStatus(userId: number, isActive: boolean) {
    this.http.patch(`${environment.apiUrl}/admin/users/${userId}/status`, { is_active: isActive }).subscribe({
      next: () => {
        this.snackBar.open(isActive ? 'User unbanned' : 'User banned', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to update user status'))
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${environment.apiUrl}/admin/users/${userId}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to delete user'))
      });
    }
  }

  analyzeUser(userId: number) {
    this.selectedUserId.set(userId);
    this.selectedAnalysis.set(null); // clear old
    this.http.get<any>(`${environment.apiUrl}/admin/users/${userId}/analysis`).subscribe({
      next: (data) => this.selectedAnalysis.set(data),
      error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to fetch analysis'))
    });
  }

  addClaim() {
    const uid = this.selectedUserId();
    if (!uid) return;
    if (!this.newClaimAmount || !this.newClaimDesc) {
      this.showError('Amount and description are required.');
      return;
    }
    const payload = { amount: this.newClaimAmount, description: this.newClaimDesc };
    this.http.post(`${environment.apiUrl}/admin/users/${uid}/claims`, payload).subscribe({
      next: () => {
        this.snackBar.open('Claim added successfully!', 'Close', { duration: 3000 });
        this.newClaimAmount = 0;
        this.newClaimDesc = '';
        this.analyzeUser(uid); // refresh analysis
      },
      error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to add claim'))
    });
  }

  showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}
