import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse, AuthResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:5000/api/auth';

  // Signals
  currentUser = signal<AuthResponse | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    this.loadUserFromStorage();
  }

  register(data: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  login(data: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('fifa_user');
    this.currentUser.set(null);
    this.router.navigate(['/landing']);
  }

  getToken(): string | null {
    const user = this.currentUser();
    return user ? user.token : null;
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem('fifa_user', JSON.stringify(auth));
    this.currentUser.set(auth);
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('fifa_user');
    if (stored) {
      try {
        const auth = JSON.parse(stored) as AuthResponse;
        this.currentUser.set(auth);
      } catch {
        localStorage.removeItem('fifa_user');
      }
    }
  }
}
