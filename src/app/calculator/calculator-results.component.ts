import { Component, inject } from '@angular/core';
import { CommonModule, PercentPipe, KeyValuePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalculatorStateService } from './calculator-state.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-calculator-results',
  imports: [CommonModule, RouterModule, PercentPipe, KeyValuePipe, CurrencyPipe, MatCardModule, MatButtonModule],
  templateUrl: './calculator-results.html'
})
export class CalculatorResultsComponent {
  private state = inject(CalculatorStateService);
  private router = inject(Router);
  authService = inject(AuthService);

  name = this.state.name;
  prediction = this.state.prediction;

  get premiumAmount(): number {
    return this.prediction()?.predicted_premium || 0;
  }

  recalculate() {
    this.state.clear();
    this.router.navigate(['/calculator']);
  }
}
