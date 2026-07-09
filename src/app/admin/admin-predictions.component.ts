import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-predictions',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSnackBarModule],
  template: `
    <div class="predictions-container">
      <h3>All Predictions</h3>
      <table mat-table [dataSource]="predictions()" class="mat-elevation-z8">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> ID </th>
          <td mat-cell *matCellDef="let pred"> {{pred.id}} </td>
        </ng-container>

        <!-- User ID Column -->
        <ng-container matColumnDef="user_id">
          <th mat-header-cell *matHeaderCellDef> User ID </th>
          <td mat-cell *matCellDef="let pred"> {{pred.user_id}} </td>
        </ng-container>
        
        <!-- Premium Column -->
        <ng-container matColumnDef="premium">
          <th mat-header-cell *matHeaderCellDef> Premium </th>
          <td mat-cell *matCellDef="let pred"> {{pred.predicted_premium | currency:'INR'}} </td>
        </ng-container>
        
        <!-- Category Column -->
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef> Category </th>
          <td mat-cell *matCellDef="let pred"> {{pred.predicted_category}} </td>
        </ng-container>

        <!-- Created At Column -->
        <ng-container matColumnDef="created_at">
          <th mat-header-cell *matHeaderCellDef> Date </th>
          <td mat-cell *matCellDef="let pred"> {{pred.created_at | date:'short'}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .predictions-container {
      width: 100%;
    }
    table {
      width: 100%;
    }
  `]
})
export class AdminPredictionsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  predictions = signal<any[]>([]);
  displayedColumns: string[] = ['id', 'user_id', 'premium', 'category', 'created_at'];

  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(`${environment.apiUrl}/admin/predictions`).subscribe({
      next: (data) => this.predictions.set(data),
      error: () => this.snackBar.open('Failed to load predictions', 'Close', { duration: 3000 })
    });
  }
}
