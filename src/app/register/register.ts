import { Component, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink, Router } from '@angular/router';
import { form, FormField, required, email, minLength, pattern, FormRoot, validate } from '@angular/forms/signals';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';
import { ApiErrorService } from '../api-error.service';

interface RegisterData {
  full_name: string;
  email: string;
  phone_no: string;
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
    MatProgressSpinnerModule,
    RouterLink,
    FormField,
    FormRoot,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiError = inject(ApiErrorService);

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  registerModel = signal<RegisterData>({
    full_name: '',
    email: '',
    phone_no: '',
    password: '',
    confirmPassword: '',
  });

  readonly registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.full_name, { message: 'Full Name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email' });
    required(schemaPath.phone_no, { message: 'Phone number is required' });
    pattern(schemaPath.phone_no, /^(?:\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/, { message: 'Please enter a valid Indian phone number' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
    required(schemaPath.confirmPassword, { message: 'Confirm Password is required' });
    minLength(schemaPath.confirmPassword, 8, {
      message: 'Confirm Password must be at least 8 characters',
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

  onSubmit() {
    if (!this.registerForm().valid()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { full_name, email, phone_no, password } = this.registerModel();

    this.authService.register(full_name, email, phone_no, password).subscribe({
      next: () => {
        // Auto login after successful registration
        this.authService.login(email, password).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/']); // Or wherever they should go after login
          },
          error: () => {
            // Registration succeeded but auto-login failed for some reason
            this.isLoading.set(false);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.apiError.getMessage(err, 'Registration failed. Please try again.'));
      }
    });
  }
}
