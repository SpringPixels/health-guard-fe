import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, required, min, FormRoot } from '@angular/forms/signals';
import { CalculatorStateService, PredictionResponse } from './calculator-state.service';
import { environment } from '../../environments/environment';

interface CalculatorData {
  name: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  incomeLpa: number | null;
  isSmoker: string; // 'yes' or 'no'
  city: string;
  occupation: string;
}

@Component({
  selector: 'app-calculator',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    FormField,
    FormRoot,
  ],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
})
export class CalculatorComponent {
  private router = inject(Router);
  private state = inject(CalculatorStateService);
  private http = inject(HttpClient);

  cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Other Tier 1', 'Tier 2/3 City'];
  occupations = ["Teacher", "Business Owner", "Student", "Retired", "Doctor", "Software Engineer", "Sales Executive", "Banker"];

  calcModel = signal<CalculatorData>({
    name: '',
    age: null,
    weight: null,
    height: null,
    incomeLpa: null,
    isSmoker: '',
    city: '',
    occupation: '',
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  readonly calcForm = form(this.calcModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });

    required(schemaPath.age, { message: 'Age is required' });
    min(schemaPath.age, 18, { message: 'Must be at least 18' });

    required(schemaPath.weight, { message: 'Weight is required' });
    min(schemaPath.weight, 30, { message: 'Invalid weight' });

    required(schemaPath.height, { message: 'Height is required' });
    min(schemaPath.height, 1, { message: 'Invalid height' });

    required(schemaPath.incomeLpa, { message: 'Income is required' });
    min(schemaPath.incomeLpa, 0, { message: 'Cannot be negative' });

    required(schemaPath.isSmoker, { message: 'Please specify smoking habits' });
    required(schemaPath.city, { message: 'City is required' });
    required(schemaPath.occupation, { message: 'Occupation is required' });
  });

  calculate() {
    if (this.calcForm().valid()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const data = this.calcModel();

      const payload = {
        age: data.age,
        weight: data.weight,
        height: data.height,
        income_lpa: data.incomeLpa,
        smoker: data.isSmoker === 'yes',
        city: data.city,
        occupation: data.occupation
      };

      this.http.post<PredictionResponse>(`${environment.apiUrl}/predict/explain`, payload).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.state.setResult(data.name, response);
          this.router.navigate(['/calculator/results']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('An error occurred while calculating your premium. Please try again.');
          console.error('Calculation Error:', err);
        }
      });
    }
  }
}

