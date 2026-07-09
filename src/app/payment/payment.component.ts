import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CalculatorStateService } from '../calculator/calculator-state.service';
import { AuthService } from '../auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule, 
    MatCardModule, 
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment.html'
})
export class PaymentComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private state = inject(CalculatorStateService);
  private auth = inject(AuthService);

  get amount(): number {
    return this.state.prediction()?.predicted_premium || 0;
  }

  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  paymentForm = this.fb.group({
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
  });

  processPayment() {
    if (this.paymentForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set('');
      
      const payload = { amount: this.amount };
      
      this.http.post(`${environment.apiUrl}/payments/create`, payload).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.successMessage.set('Payment successful! Redirecting...');
          this.auth.isPaid.set(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('paid', 'true');
          }
          setTimeout(() => {
            this.router.navigate(['/predictions']);
          }, 2000);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set('Payment failed. Please try again.');
          console.error(err);
        }
      });
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
