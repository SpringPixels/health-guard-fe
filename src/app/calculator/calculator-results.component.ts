import { Component, inject } from '@angular/core';
import { CommonModule, PercentPipe, KeyValuePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalculatorStateService } from './calculator-state.service';

@Component({
  selector: 'app-calculator-results',
  imports: [CommonModule, RouterModule, PercentPipe, KeyValuePipe, MatCardModule, MatButtonModule],
  templateUrl: './calculator-results.html'
})
export class CalculatorResultsComponent {
  private state = inject(CalculatorStateService);
  private router = inject(Router);

  name = this.state.name;
  prediction = this.state.prediction;

  recalculate() {
    this.state.clear();
    this.router.navigate(['/calculator']);
  }
}
