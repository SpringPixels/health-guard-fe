import { Injectable, signal } from '@angular/core';

export interface PredictionResponse {
  predicted_category: string;
  confidence: number;
  class_probabilities: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class CalculatorStateService {
  name = signal<string>('');
  prediction = signal<PredictionResponse | null>(null);

  setResult(name: string, prediction: PredictionResponse) {
    this.name.set(name);
    this.prediction.set(prediction);
  }

  clear() {
    this.name.set('');
    this.prediction.set(null);
  }
}
