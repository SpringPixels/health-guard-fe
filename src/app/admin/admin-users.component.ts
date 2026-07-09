import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatSelectModule, MatSnackBarModule],
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

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let user">
            <button mat-button color="warn" (click)="deleteUser(user.id)">Delete</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .users-container {
      width: 100%;
    }
    table {
      width: 100%;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  users = signal<any[]>([]);
  displayedColumns: string[] = ['id', 'email', 'role', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.showError('Failed to load users')
    });
  }

  updateRole(userId: number, newRole: string) {
    this.http.patch(`${environment.apiUrl}/admin/users/${userId}/role`, { role: newRole }).subscribe({
      next: () => this.snackBar.open('Role updated', 'Close', { duration: 3000 }),
      error: () => this.showError('Failed to update role')
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${environment.apiUrl}/admin/users/${userId}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: () => this.showError('Failed to delete user')
      });
    }
  }

  showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
