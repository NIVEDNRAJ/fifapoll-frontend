import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div style="display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 64px); padding: 20px;">
      <mat-card style="width: 100%; max-width: 420px; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid rgba(128,128,128,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: var(--primary-color);">sports_soccer</mat-icon>
          <h2 style="font-family: 'Outfit'; font-size: 2rem; font-weight: 800; margin: 8px 0 4px 0;">Welcome Back</h2>
          <p style="font-size: 0.95rem; opacity: 0.7; margin: 0;">Sign in to manage your World Cup vote</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 16px;">
          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g. user@example.com" id="login-email">
            <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" id="login-password">
            <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword()">
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || isLoading()" style="padding: 12px; font-family: 'Outfit'; font-weight: bold; font-size: 1rem; margin-top: 8px;" id="login-submit">
            <span *ngIf="!isLoading()">Sign In</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" style="margin: 0 auto;"></mat-spinner>
          </button>
        </form>

        <div style="margin-top: 24px; text-align: center; font-size: 0.9rem;">
          <span style="opacity: 0.7;">Don't have an account? </span>
          <a routerLink="/register" style="color: var(--primary-color); font-weight: 600; text-decoration: none;">Register here</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success) {
            this.snackBar.open(res.message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
            if (res.data.role === 'Admin') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.snackBar.open(res.message, 'Close', { duration: 4000 });
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.snackBar.open(err.message || 'Login failed. Please check credentials.', 'Close', { duration: 4000 });
        }
      });
    }
  }
}
