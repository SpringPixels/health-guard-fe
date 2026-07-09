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
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
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
  editingPremium: boolean = false;
  editPremiumValue: number = 0;

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

  savePremium() {
    const uid = this.selectedUserId();
    if (!uid) return;
    this.http.patch(`${environment.apiUrl}/admin/users/${uid}/premium`, { base_premium: this.editPremiumValue }).subscribe({
      next: () => {
        this.snackBar.open('Premium updated successfully!', 'Close', { duration: 3000 });
        this.editingPremium = false;
        this.analyzeUser(uid); // refresh analysis
      },
      error: (err) => this.showError(this.apiError.getMessage(err, 'Failed to update premium'))
    });
  }

  showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}
