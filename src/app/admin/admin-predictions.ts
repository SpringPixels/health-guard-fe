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
  templateUrl: './admin-predictions.html',
  styleUrls: ['./admin-predictions.css']
})
export class AdminPredictions implements OnInit {
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
