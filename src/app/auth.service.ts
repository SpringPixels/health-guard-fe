import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  isLoggedIn = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  email = signal<string | null>(null);
  fullName = signal<string | null>(null);

  private readonly tokenKey = 'token';
  private readonly emailKey = 'email';
  private readonly adminKey = 'admin';
  private readonly nameKey = 'full_name';

  constructor() {
    // Initialize state from local storage on startup
    if (typeof window !== 'undefined' && this.getToken()) {
      this.isLoggedIn.set(true);

      const savedEmail = localStorage.getItem(this.emailKey);
      if (savedEmail) this.email.set(savedEmail);

      const savedName = localStorage.getItem(this.nameKey);
      if (savedName) this.fullName.set(savedName);

      const savedAdmin = localStorage.getItem(this.adminKey);
      if (savedAdmin === 'true') this.isAdmin.set(true);
    }
  }

  register(full_name: string, email: string, phone_no: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/signup`, { full_name, email, phone_no, password });
  }

  login(email: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);

    return this.http.post(`${environment.apiUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((res: any) => {
        if (res && res.access_token) {
          this.isLoggedIn.set(true);
          this.email.set(email);

          if (typeof window !== 'undefined') {
            localStorage.setItem(this.tokenKey, res.access_token);
            localStorage.setItem(this.emailKey, email);
          }
        }
      }),
      // Fetch user profile to get role/admin status and full name
      switchMap(() => this.http.get(`${environment.apiUrl}/me`)),
      tap((profile: any) => {
        // Assume profile has a role property and full_name property
        const isUserAdmin = profile && profile.role === 'admin';
        this.isAdmin.set(isUserAdmin);
        
        if (profile && profile.full_name) {
          this.fullName.set(profile.full_name);
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(this.adminKey, isUserAdmin ? 'true' : 'false');
          if (profile && profile.full_name) {
            localStorage.setItem(this.nameKey, profile.full_name);
          }
        }
      })
    );
  }

  logout() {
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.email.set(null);
    this.fullName.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.emailKey);
      localStorage.removeItem(this.adminKey);
      localStorage.removeItem(this.nameKey);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }
}
