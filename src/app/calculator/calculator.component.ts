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
import { ApiErrorService } from '../api-error.service';
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
  private apiError = inject(ApiErrorService);

  tier1Cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
  tier2Cities = [
    'Jaipur', 'Chandigarh', 'Indore', 'Lucknow', 'Patna', 'Visakhapatnam', 'Coimbatore',
    'Bhopal', 'Nagpur', 'Vadodara', 'Surat', 'Rajkot', 'Jodhpur', 'Raipur', 'Amritsar', 'Varanasi',
    'Agra', 'Dehradun', 'Mysore', 'Jabalpur', 'Guwahati', 'Thiruvananthapuram', 'Ludhiana', 'Nashik',
    'Allahabad', 'Udaipur', 'Aurangabad', 'Hubli', 'Belgaum', 'Salem', 'Vijayawada', 'Tiruchirappalli',
    'Bhavnagar', 'Gwalior', 'Dhanbad', 'Bareilly', 'Aligarh', 'Gaya', 'Kozhikode', 'Warangal',
    'Kolhapur', 'Bilaspur', 'Jalandhar', 'Noida', 'Guntur', 'Asansol', 'Siliguri'
  ];
  tier3Cities = [
    'Shimla', 'Manali', 'Dharamshala', 'Srinagar', 'Jammu', 'Leh', 'Gangtok', 'Shillong',
    'Aizawl', 'Imphal', 'Agartala', 'Itanagar', 'Kohima', 'Dispur', 'Daman', 'Silvassa',
    'Puducherry', 'Panaji', 'Port Blair', 'Kavaratti', 'Ajmer', 'Bikaner', 'Kota', 'Alwar',
    'Firozabad', 'Mathura', 'Muzaffarnagar', 'Saharanpur', 'Moradabad', 'Gorakhpur', 'Meerut',
    'Kanpur', 'Prayagraj', 'Hapur', 'Rampur', 'Shahjahanpur', 'Loni', 'Mangalore', 'Mysuru',
    'Davangere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Hassan', 'Gulbarga',
    'Kurnool', 'Rajahmundry', 'Nellore', 'Tirupati', 'Eluru', 'Anantapur', 'Kadapa',
    'Madurai', 'Vellore', 'Erode', 'Tirunelveli', 'Tiruppur', 'Thoothukudi', 'Dindigul',
    'Bhilai', 'Korba', 'Durg', 'Rajnandgaon', 'Jamshedpur', 'Bokaro', 'Hazaribagh', 'Ranchi',
    'Cuttack', 'Berhampur', 'Brahmapur', 'Rourkela', 'Sambalpur', 'Bhubaneswar',
    'Ahmedabad', 'Anand', 'Navsari', 'Junagadh', 'Gandhinagar', 'Mehsana',
    'Amravati', 'Nanded', 'Solapur', 'Sangli', 'Latur', 'Akola', 'Jalgaon', 'Dhule',
    'Kochi', 'Thrissur', 'Kollam', 'Kannur', 'Palakkad', 'Malappuram', 'Alappuzha',
    'Rohtak', 'Hisar', 'Panipat', 'Karnal', 'Yamunanagar', 'Ambala', 'Sonipat',
    'Jabalpur', 'Ujjain', 'Satna', 'Sagar', 'Rewa', 'Guna', 'Burhanpur', 'Morena'
  ];
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

      this.http.post<any>(`${environment.apiUrl}/predict/explain`, payload).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          const mappedPrediction: PredictionResponse = {
            predicted_category: response.prediction_results?.predicted_category || response.predicted_category,
            confidence: response.prediction_results?.confidence_score || response.confidence,
            class_probabilities: response.prediction_results?.all_class_probabilities || response.class_probabilities,
            predicted_premium: response.predicted_premium
          };
          this.state.setResult(data.name, mappedPrediction);
          this.router.navigate(['/calculator/results']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.apiError.getMessage(err, 'An error occurred while calculating your premium. Please try again.'));
          console.error('Calculation Error:', err);
        }
      });
    }
  }
}

