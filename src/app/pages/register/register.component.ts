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
  selector: 'app-register',
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
      <mat-card style="width: 100%; max-width: 460px; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid rgba(128,128,128,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: var(--primary-color);">sports_soccer</mat-icon>
          <h2 style="font-family: 'Outfit'; font-size: 2rem; font-weight: 800; margin: 8px 0 4px 0;">Create Account</h2>
          <p style="font-size: 0.95rem; opacity: 0.7; margin: 0;">Sign up to vote for your World Cup champion</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 16px;">
          
          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Full Name</mat-label>
            <input matInput type="text" formControlName="name" placeholder="e.g. John Doe" id="reg-name">
            <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">person</mat-icon>
            <mat-error *ngIf="registerForm.get('name')?.hasError('required')">Name is required</mat-error>
            <mat-error *ngIf="registerForm.get('name')?.hasError('minlength')">Name must be at least 3 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g. user@example.com" id="reg-email">
            <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" id="reg-password">
            <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button" [attr.aria-label]="'Hide password'">
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
              Must be min 8 chars, with uppercase, lowercase, number, and special character
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Confirm Password</mat-label>
            <input matInput [type]="hideConfirmPassword() ? 'password' : 'text'" formControlName="confirmPassword" id="reg-confirm-password">
            <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">lock_reset</mat-icon>
            <button mat-icon-button matSuffix (click)="hideConfirmPassword.set(!hideConfirmPassword())" type="button" [attr.aria-label]="'Hide confirm password'">
              <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Confirm password is required</mat-error>
            <mat-error *ngIf="registerForm.hasError('passwordMismatch')">Passwords do not match</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || isLoading()" style="padding: 12px; font-family: 'Outfit'; font-weight: bold; font-size: 1rem; margin-top: 8px;" id="reg-submit">
            <span *ngIf="!isLoading()">Register</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" style="margin: 0 auto;"></mat-spinner>
          </button>
        </form>

        <div style="margin-top: 24px; text-align: center; font-size: 0.9rem;">
          <span style="opacity: 0.7;">Already have an account? </span>
          <a routerLink="/login" style="color: var(--primary-color); font-weight: 600; text-decoration: none;">Sign in here</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);
  hideConfirmPassword = signal<boolean>(true);

  constructor() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success) {
            this.snackBar.open(res.message, 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(res.message, 'Close', { duration: 4000 });
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.snackBar.open(err.message || 'Registration failed. Please try again.', 'Close', { duration: 4000 });
        }
      });
    }
  }
}
