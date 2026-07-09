import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

export interface PredictionHistory {
  id?: number;
  predicted_category: string;
  predicted_premium?: number;
  confidence: number;
  created_at?: string;
  age_group?: string;
  city_tier?: number;
  occupation?: string;
  income_lpa?: number;
  lifestyle_risk?: string;
}

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterLink,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './predictions.html',
})
export class PredictionsComponent implements OnInit {
  private http = inject(HttpClient);

  predictions = signal<PredictionHistory[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // We assume the interceptor will attach the token
    this.http.get<PredictionHistory[]>(`${environment.apiUrl}/predictions/me`).subscribe({
      next: (data) => {
        this.predictions.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching history:', err);
        this.errorMessage.set('Could not load prediction history. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}
