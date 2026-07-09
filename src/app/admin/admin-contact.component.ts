import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSnackBarModule],
  template: `
    <div class="contact-container">
      <h3>Contact Messages</h3>
      <table mat-table [dataSource]="messages()" class="mat-elevation-z8">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> ID </th>
          <td mat-cell *matCellDef="let msg"> {{msg.id}} </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let msg"> {{msg.name}} </td>
        </ng-container>
        
        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef> Email </th>
          <td mat-cell *matCellDef="let msg"> {{msg.email}} </td>
        </ng-container>

        <!-- Subject Column -->
        <ng-container matColumnDef="subject">
          <th mat-header-cell *matHeaderCellDef> Subject </th>
          <td mat-cell *matCellDef="let msg"> {{msg.subject}} </td>
        </ng-container>
        
        <!-- Message Column -->
        <ng-container matColumnDef="message">
          <th mat-header-cell *matHeaderCellDef> Message </th>
          <td mat-cell *matCellDef="let msg"> {{msg.message}} </td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="created_at">
          <th mat-header-cell *matHeaderCellDef> Date </th>
          <td mat-cell *matCellDef="let msg"> {{msg.created_at | date:'short'}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .contact-container {
      width: 100%;
    }
    table {
      width: 100%;
    }
  `]
})
export class AdminContactComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  messages = signal<any[]>([]);
  displayedColumns: string[] = ['id', 'name', 'email', 'subject', 'message', 'created_at'];

  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(`${environment.apiUrl}/admin/contact-us`).subscribe({
      next: (data) => this.messages.set(data),
      error: () => this.snackBar.open('Failed to load messages', 'Close', { duration: 3000 })
    });
  }
}
