import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { form, FormField, required, email, minLength, FormRoot, validate } from '@angular/forms/signals';
import { MatDividerModule } from '@angular/material/divider';

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RouterLink,
    FormField,
    FormRoot,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerModel = signal<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  readonly registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 6, { message: 'Password must be at least 6 characters' });
    required(schemaPath.confirmPassword, { message: 'Confirm Password is required' });
    minLength(schemaPath.confirmPassword, 6, {
      message: 'Confirm Password must be at least 6 characters',
    });
    validate(schemaPath.confirmPassword, (context) => {
      const passwordValue = context.valueOf(schemaPath.password);
      const confirmPasswordValue = context.value();

      if (passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue) {
        return { kind: 'passwordMatch', message: 'Passwords do not match' };
      }
      return undefined;
    });
  });
}
