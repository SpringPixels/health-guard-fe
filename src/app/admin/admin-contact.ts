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
  templateUrl: './admin-contact.html',
  styleUrls: ['./admin-contact.css']
})
export class AdminContact implements OnInit {
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
