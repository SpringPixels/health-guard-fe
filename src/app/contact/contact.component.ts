import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, FormField, required, email, FormRoot } from '@angular/forms/signals';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatIconModule,
    FormField,
    FormRoot,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  contactModel = signal<ContactData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  readonly contactForm = form(this.contactModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email' });
    required(schemaPath.subject, { message: 'Subject is required' });
    required(schemaPath.message, { message: 'Message is required' });
  });

  onSubmit() {
    if (this.contactForm().valid()) {
      alert('Thank you for contacting us! We will get back to you shortly.');
      // Reset form model
      this.contactModel.set({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      // Force form reset if needed, though signals form updates reactively
    }
  }
}
